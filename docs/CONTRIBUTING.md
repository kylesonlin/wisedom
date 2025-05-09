# Contributing Guide

This guide outlines the process for contributing to the API project.

## Getting Started

### Prerequisites

1. **Development Environment**
   - Node.js 18.x
   - npm 9.x
   - Git
   - VS Code (recommended)
   - Docker (optional)

2. **Required Tools**
   - Git
   - Node.js
   - npm
   - Docker (optional)
   - Postman (optional)

3. **Required Accounts**
   - GitHub
   - Supabase
   - Vercel (optional)
   - Sentry (optional)

### Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/your-username/api.git
   cd api
   
   # Add upstream remote
   git remote add upstream https://github.com/original-owner/api.git
   ```

2. **Install Dependencies**
   ```bash
   # Install dependencies
   npm install
   
   # Install development dependencies
   npm install -D
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables
   cp .env.example .env.local
   
   # Update environment variables
   # Add your Supabase credentials
   # Add your other service credentials
   ```

## Development Workflow

### Branching Strategy

1. **Main Branches**
   - `main`: Production-ready code
   - `develop`: Development branch
   - `feature/*`: Feature branches
   - `bugfix/*`: Bug fix branches
   - `release/*`: Release branches

2. **Branch Naming**
   ```
   feature/feature-name
   bugfix/bug-description
   release/version-number
   ```

3. **Branch Management**
   - Create branch from `develop`
   - Keep branch up to date
   - Delete branch after merge
   - Use descriptive names

### Code Style

1. **TypeScript**
   - Use strict mode
   - Follow style guide
   - Use type definitions
   - Document interfaces

2. **API Design**
   - Follow REST principles
   - Use consistent naming
   - Version all endpoints
   - Document responses

3. **Testing**
   - Write unit tests
   - Write integration tests
   - Maintain coverage
   - Test edge cases

### Commit Guidelines

1. **Commit Message Format**
   ```
   type(scope): subject
   
   body
   
   footer
   ```

2. **Types**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `style`: Formatting
   - `refactor`: Code change
   - `test`: Testing
   - `chore`: Maintenance

3. **Examples**
   ```
   feat(auth): add OAuth2 support
   
   - Add OAuth2 provider
   - Add token handling
   - Add user mapping
   
   Closes #123
   ```

## Pull Requests

### Creating PRs

1. **Before Creating**
   - Update your branch
   - Run tests
   - Check linting
   - Update documentation

2. **PR Description**
   - Describe changes
   - Link issues
   - Add screenshots
   - Update changelog

3. **Review Process**
   - Address comments
   - Update code
   - Add tests
   - Update docs

### Review Guidelines

1. **Code Review**
   - Check functionality
   - Review tests
   - Check style
   - Verify security

2. **Documentation**
   - Update API docs
   - Update README
   - Add comments
   - Update changelog

3. **Testing**
   - Run all tests
   - Check coverage
   - Test manually
   - Verify edge cases

## Testing

### Unit Tests

1. **Test Structure**
   ```typescript
   describe('Component', () => {
     it('should do something', () => {
       // Test code
     });
   });
   ```

2. **Test Coverage**
   - Aim for 80% coverage
   - Test edge cases
   - Test error cases
   - Test success cases

3. **Test Data**
   - Use test fixtures
   - Mock external services
   - Use test database
   - Clean up after tests

### Integration Tests

1. **API Tests**
   ```typescript
   describe('API', () => {
     it('should handle request', async () => {
       // Test code
     });
   });
   ```

2. **Database Tests**
   ```typescript
   describe('Database', () => {
     it('should handle query', async () => {
       // Test code
     });
   });
   ```

3. **Service Tests**
   ```typescript
   describe('Service', () => {
     it('should handle operation', async () => {
       // Test code
     });
   });
   ```

## Documentation

### API Documentation

1. **Endpoint Documentation**
   ```markdown
   ## Endpoint Name
   
   ### Description
   Brief description of the endpoint.
   
   ### Request
   - Method: GET/POST/PUT/DELETE
   - Path: /api/v1/resource
   - Headers: Content-Type: application/json
   - Body: { ... }
   
   ### Response
   - Status: 200 OK
   - Body: { ... }
   ```

2. **Schema Documentation**
   ```typescript
   /**
    * User schema
    * @interface User
    */
   interface User {
     /** User ID */
     id: string;
     /** User email */
     email: string;
     /** User name */
     name: string;
   }
   ```

3. **Example Documentation**
   ```typescript
   /**
    * Example usage
    * @example
    * const user = await api.getUser('123');
    * console.log(user.name);
    */
   ```

### Code Documentation

1. **Function Documentation**
   ```typescript
   /**
    * Function description
    * @param {string} param1 - Parameter description
    * @param {number} param2 - Parameter description
    * @returns {Promise<Result>} Result description
    * @throws {Error} Error description
    */
   ```

2. **Class Documentation**
   ```typescript
   /**
    * Class description
    * @class
    */
   class Example {
     /**
      * Method description
      * @param {string} param - Parameter description
      */
     method(param: string): void {}
   }
   ```

3. **Interface Documentation**
   ```typescript
   /**
    * Interface description
    * @interface
    */
   interface Example {
     /** Property description */
     property: string;
   }
   ```

## Release Process

### Versioning

1. **Semantic Versioning**
   - Major: Breaking changes
   - Minor: New features
   - Patch: Bug fixes

2. **Changelog**
   ```markdown
   # Changelog
   
   ## [1.0.0] - 2024-01-01
   ### Added
   - New feature 1
   - New feature 2
   
   ### Changed
   - Updated feature 1
   - Updated feature 2
   
   ### Fixed
   - Fixed bug 1
   - Fixed bug 2
   ```

3. **Release Notes**
   - Document changes
   - List new features
   - Note breaking changes
   - Provide migration guide

### Deployment

1. **Staging**
   - Deploy to staging
   - Run tests
   - Verify functionality
   - Check performance

2. **Production**
   - Deploy to production
   - Monitor metrics
   - Check logs
   - Verify security

3. **Post-release**
   - Update documentation
   - Monitor issues
   - Gather feedback
   - Plan next release

## Support

For contribution-related issues, please contact:
- Development Team: development@example.com
- Project Maintainers: maintainers@example.com
- Community Manager: community@example.com
- Technical Support: support@example.com 