# Contributing to Finalysis

Thank you for your interest in contributing to Finalysis! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/finalysis.git
   cd finalysis
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Start the development servers:
   ```bash
   # Terminal 1: Start Expo
   npm run web
   
   # Terminal 2: Start Netlify Functions
   npm run serve
   ```

2. Make your changes
3. Test your changes thoroughly
4. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   ```
5. Commit your changes with a descriptive message
6. Push to your fork and submit a pull request

## Code Style

- Use ESLint and Prettier configurations provided
- Follow React Native best practices
- Write descriptive commit messages
- Add comments for complex logic

## Testing

- Test your changes on both web and mobile (if applicable)
- Ensure all existing functionality still works
- Test with different stock tickers
- Verify API functions work correctly

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if necessary
3. Provide a clear description of changes
4. Reference any related issues
5. Ensure CI checks pass

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Device/browser information

## Feature Requests

For feature requests, please provide:
- Clear description of the feature
- Use case or business justification
- Proposed implementation (if any)

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.
