// Enhanced error logging for debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.log('%c Global error caught:', 'color: red; font-weight: bold; font-size: 14px;');
  console.log('%c Message:', 'font-weight: bold;', message);
  console.log('%c Source:', 'font-weight: bold;', source);
  console.log('%c Line:', 'font-weight: bold;', lineno);
  console.log('%c Column:', 'font-weight: bold;', colno);
  console.log('%c Error object:', 'font-weight: bold;', error);

  if (error && error.stack) {
    console.log('%c Stack trace:', 'font-weight: bold;', error.stack);
  }

  return false;
};

// Enhanced React error logging
const originalConsoleError = console.error;
console.error = function() {
  // Apply original console.error
  originalConsoleError.apply(console, arguments);

  // Get the error message
  const errorMessage = Array.from(arguments).join(' ');

  // Log stack trace for React errors
  console.log('%c React Error Details:', 'color: red; font-weight: bold;');
  console.log('%c Error Message:', 'font-weight: bold;', errorMessage);
  console.log('%c Stack trace:', 'font-weight: bold;', new Error().stack);
};

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.log('%c Unhandled Promise Rejection:', 'color: red; font-weight: bold; font-size: 14px;');
  console.log('%c Reason:', 'font-weight: bold;', event.reason);

  if (event.reason instanceof Error) {
    console.log('%c Error name:', 'font-weight: bold;', event.reason.name);
    console.log('%c Error message:', 'font-weight: bold;', event.reason.message);
    console.log('%c Stack trace:', 'font-weight: bold;', event.reason.stack);
  }
});

// Log API request errors
const originalFetch = window.fetch;
window.fetch = function() {
  return originalFetch.apply(this, arguments)
    .catch(error => {
      console.log('%c Fetch API Error:', 'color: red; font-weight: bold;');
      console.log('%c URL:', 'font-weight: bold;', arguments[0]);
      console.log('%c Error:', 'font-weight: bold;', error);
      throw error;
    });
};
