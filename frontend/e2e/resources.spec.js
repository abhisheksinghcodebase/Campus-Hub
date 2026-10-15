const { test, expect } = require('@playwright/test');

const student = {
  id: 'student-1',
  name: 'Sam Student',
  email: 'student@college.edu',
  role: 'student',
};

const teacher = {
  id: 'teacher-1',
  name: 'Taylor Teacher',
  email: 'teacher@college.edu',
  role: 'teacher',
};

const sampleResource = {
  _id: 'resource-1',
  title: 'Engineering Mathematics Unit 1',
  description: 'Differential equations study notes',
  subject: 'Engineering Mathematics-II',
  topic: 'Linear Differential Equations',
  type: 'notes',
  s3Key: 'resources/teacher-1/unit-1.pdf',
  originalFileName: 'unit-1.pdf',
  uploadedBy: { name: 'Taylor Teacher' },
  createdAt: '2026-10-14T00:00:00.000Z',
};

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const signInAs = async (page, user) => {
  await page.addInitScript((token) => localStorage.setItem('token', token), 'test-token');
  await page.route('http://localhost:5000/api/auth/me', (route) =>
    json(route, { success: true, user })
  );
  await page.goto('/resources');
  await expect(page.getByRole('heading', { level: 1,
    name: user.role === 'teacher' ? /Manage Your Resources/ : /Discover Learning Materials/,
  })).toBeVisible();
};

test('student searches and filters resources, then downloads a PDF', async ({ page }) => {
  const resources = [
    sampleResource,
    { ...sampleResource, _id: 'resource-2', title: '2025 Mathematics PYQ', type: 'pyq' },
  ];
  const observedQueries = [];

  await page.route('http://localhost:5000/api/resources**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/download')) {
      expect(route.request().headers().authorization).toBe('Bearer test-token');
      return route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: { 'content-disposition': 'attachment; filename="unit-1.pdf"' },
        body: '%PDF-1.4\nsample',
      });
    }
    const q = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type');
    observedQueries.push({ q, type });
    const filtered = resources.filter((resource) =>
      (!q || `${resource.title} ${resource.subject} ${resource.topic}`.toLowerCase().includes(q.toLowerCase()))
      && (!type || resource.type === type)
    );
    return json(route, {
      success: true,
      resources: filtered,
      pagination: { page: 1, limit: 12, total: filtered.length, pages: 1 },
    });
  });
  await signInAs(page, student);
  await expect(page.getByRole('heading', { name: sampleResource.title })).toBeVisible();
  await expect(page.getByRole('heading', { name: '➕ Publish New Resource' })).toHaveCount(0);

  await page.locator('#resource-search').fill('Differential');
  await expect(page.getByRole('heading', { name: sampleResource.title })).toBeVisible();
  await expect.poll(() => observedQueries.some(({ q }) => q === 'Differential')).toBe(true);

  await page.getByLabel('Filter by resource type').selectOption('pyq');
  await expect(page.getByRole('heading', { name: '2025 Mathematics PYQ' })).toBeVisible();
  await expect(page.getByRole('heading', { name: sampleResource.title })).toHaveCount(0);
  await expect.poll(() => observedQueries.some(({ type }) => type === 'pyq')).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Open PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('unit-1.pdf');
});

test('teacher uploads and publishes a PDF, edits its details, and removes its listing', async ({ page }) => {
  let published = null;
  const records = [];
  await page.route('http://localhost:5000/api/resources**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/upload') && route.request().method() === 'POST') {
      return json(route, {
        success: true,
        key: 'resources/teacher-1/uploaded-unit.pdf',
        originalFileName: 'uploaded-unit.pdf',
      }, 201);
    }
    if (url.pathname.endsWith('/resource-1') && route.request().method() === 'PATCH') {
      published = { ...published, ...route.request().postDataJSON() };
      records.splice(0, records.length, published);
      return json(route, { success: true, resource: published });
    }
    if (url.pathname.endsWith('/resource-1') && route.request().method() === 'DELETE') {
      records.length = 0;
      return json(route, { success: true, message: 'Resource deleted.' });
    }
    if (url.pathname.endsWith('/resources') && route.request().method() === 'POST') {
      published = {
        ...route.request().postDataJSON(),
        ...sampleResource,
        title: route.request().postDataJSON().title,
        subject: route.request().postDataJSON().subject,
        topic: route.request().postDataJSON().topic,
        type: route.request().postDataJSON().type,
        _id: 'resource-1',
        uploadedBy: { name: teacher.name },
      };
      records.splice(0, records.length, published);
      return json(route, { success: true, resource: published }, 201);
    }
    return json(route, {
      success: true,
      resources: url.searchParams.get('mine') === 'true' || !url.searchParams.has('mine')
        ? records
        : [],
      pagination: { page: 1, limit: 12, total: records.length, pages: 1 },
    });
  });

  await signInAs(page, teacher);
  await expect(page.getByRole('heading', { name: '➕ Publish New Resource' })).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('Unit 1 calculus notes');
  await page.getByLabel('Subject', { exact: true }).fill('Calculus');
  await page.getByLabel('Topic / unit').fill('Limits and continuity');
  await page.locator('#resource-file').setInputFiles({
    name: 'uploaded-unit.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nsample pdf bytes'),
  });
  await page.getByRole('button', { name: 'Publish resource' }).click();
  await expect(page.getByRole('status')).toContainText('Resource published.');
  await expect(page.getByRole('heading', { name: 'Unit 1 calculus notes' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.getByLabel('Title', { exact: true }).fill('Unit 1 calculus notes updated');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Resource updated.');
  await expect(page.getByRole('heading', { name: 'Unit 1 calculus notes updated' }).first()).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByRole('status')).toContainText('Resource removed from the hub.');
  await expect(page.getByRole('heading', { name: 'Unit 1 calculus notes updated' })).toHaveCount(0);
});
