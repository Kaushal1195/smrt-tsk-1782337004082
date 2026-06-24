describe('Frontend Mobile Task View', () => {
  const user = {
    id: 'user-ben',
    name: 'Ben The Doer',
    email: 'ben@example.com',
  };

  const mockTasks = [
    {
      id: 'task-mobile-1',
      name: 'Complete Cypress Tests',
      description: 'Write automated tests for mobile view.',
      dueDate: '2023-12-15T10:00:00Z',
      status: 'In Progress',
      priority: 'High',
      assigneeId: user.id,
    },
    {
      id: 'task-mobile-2',
      name: 'Review PRD Document',
      description: 'Read through the PRD and provide feedback.',
      dueDate: '2023-12-12T17:00:00Z',
      status: 'Pending',
      priority: 'Medium',
      assigneeId: user.id,
    },
    {
      id: 'task-mobile-3',
      name: 'Schedule Team Sync',
      description: 'Find a suitable time for the weekly team meeting.',
      dueDate: '2023-12-11T11:00:00Z',
      status: 'Completed',
      priority: 'Low',
      assigneeId: user.id,
    },
  ];

  beforeEach(() => {
    // Intercept API calls to provide mock data
    cy.intercept('GET', `/api/tasks/assignee/${user.id}`, {
      statusCode: 200,
      body: { tasks: mockTasks },
    }).as('getAssignedTasks');

    // Simulate login (e.g., by setting a token in localStorage or session)
    // In a real app, you might have a custom command like `cy.login()`
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-jwt-token');
      win.localStorage.setItem('currentUser', JSON.stringify(user));
    });

    // Set the viewport to a common mobile device size
    cy.viewport('iphone-x');

    // Visit the "My Tasks" page
    cy.visit('/tasks/my'); // Assuming this is the URL for "My Tasks"
  });

  // Acceptance Criteria: Mobile Task View
  it('should display a clear, responsive list of assigned tasks on mobile', () => {
    // Ensure the API call for tasks has completed
    cy.wait('@getAssignedTasks');

    // Check for the presence of a task list container
    cy.get('[data-cy="task-list"]').should('be.visible');
    cy.get('[data-cy="task-list-item"]').should('have.length', mockTasks.length);

    // Verify details for the first task
    cy.get('[data-cy="task-list-item"]').eq(0).as('firstTask');
    cy.get('@firstTask').should('contain.text', mockTasks[0].name);
    cy.get('@firstTask').should('contain.text', mockTasks[0].status);
    cy.get('@firstTask').should('contain.text', 'Dec 15'); // Check for formatted due date

    // Verify details for the second task
    cy.get('[data-cy="task-list-item"]').eq(1).as('secondTask');
    cy.get('@secondTask').should('contain.text', mockTasks[1].name);
    cy.get('@secondTask').should('contain.text', mockTasks[1].status);
    cy.get('@secondTask').should('contain.text', 'Dec 12');

    // Check for options to quickly view details, change status, or add comments
    // These might be icons or buttons within each task item
    cy.get('@firstTask').find('[data-cy="task-details-button"]').should('be.visible');
    cy.get('@firstTask').find('[data-cy="task-status-dropdown"]').should('be.visible');
    cy.get('@firstTask').find('[data-cy="task-comment-button"]').should('be.visible');

    // Test responsiveness by checking if elements are laid out correctly for mobile
    // For example, task name should be prominent, details might be collapsed or in a secondary line
    cy.get('@firstTask').find('[data-cy="task-name"]').should('have.css', 'font-size'); // Just an example, check for specific styles if needed
    cy.get('@firstTask').find('[data-cy="task-status"]').should('have.css', 'display', 'flex'); // Or 'block', depending on layout

    // Simulate clicking on a task to view details (optional, but good for flow)
    cy.get('@firstTask').click();
    cy.url().should('include', `/tasks/${mockTasks[0].id}`); // Assuming navigation to task details page
    cy.get('[data-cy="task-detail-name"]').should('contain.text', mockTasks[0].name);
  });

  it('should handle an empty task list gracefully on mobile', () => {
    // Override the previous intercept to return an empty array
    cy.intercept('GET', `/api/tasks/assignee/${user.id}`, {
      statusCode: 200,
      body: { tasks: [] },
    }).as('getEmptyAssignedTasks');

    cy.visit('/tasks/my'); // Re-visit to trigger the new intercept
    cy.wait('@getEmptyAssignedTasks');

    cy.get('[data-cy="task-list-item"]').should('not.exist');
    cy.get('[data-cy="empty-task-message"]').should('be.visible').and('contain.text', 'No tasks assigned to you.');
  });
});
