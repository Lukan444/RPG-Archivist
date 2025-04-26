/**
 * Uses localStorage and BroadcastChannel to implement a single instance check
 * This is a browser-compatible approach that doesn't rely on Node.js modules
 */

// A unique ID for this application instance
const INSTANCE_ID = Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Key for storing the active instance ID in localStorage
const ACTIVE_INSTANCE_KEY = 'rpg_archivist_active_instance';

// Channel for communication between instances
let channel: BroadcastChannel | null = null;

/**
 * Initializes the instance manager
 * @returns A cleanup function to call when the component unmounts
 */
export const initInstanceManager = (): (() => void) => {
  try {
    // Create a broadcast channel for communication between instances
    channel = new BroadcastChannel('rpg_archivist_instance_channel');
    
    // Listen for messages from other instances
    channel.onmessage = (event) => {
      if (event.data.type === 'instance_check') {
        // Another instance is checking if we're active
        channel?.postMessage({
          type: 'instance_active',
          instanceId: INSTANCE_ID,
          timestamp: Date.now()
        });
      } else if (event.data.type === 'close_request' && 
                event.data.targetInstanceId === INSTANCE_ID) {
        // Another instance is requesting us to close
        window.close();
      }
    };
    
    // Store this instance ID in localStorage
    localStorage.setItem(ACTIVE_INSTANCE_KEY, JSON.stringify({
      instanceId: INSTANCE_ID,
      timestamp: Date.now()
    }));
    
    // Set up cleanup on page unload
    const handleUnload = () => {
      const storedData = localStorage.getItem(ACTIVE_INSTANCE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.instanceId === INSTANCE_ID) {
          localStorage.removeItem(ACTIVE_INSTANCE_KEY);
        }
      }
      channel?.close();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  } catch (error) {
    console.error('Error initializing instance manager:', error);
    return () => {}; // Return empty cleanup function
  }
};

/**
 * Checks if another instance of the application is already running
 * @returns Promise resolving to the instance ID if another instance is running, null otherwise
 */
export const checkIfAppRunning = async (): Promise<string | null> => {
  try {
    // Check if there's an active instance in localStorage
    const storedData = localStorage.getItem(ACTIVE_INSTANCE_KEY);
    if (!storedData) return null;
    
    const data = JSON.parse(storedData);
    
    // If the stored instance ID is our own, no other instance is running
    if (data.instanceId === INSTANCE_ID) return null;
    
    // Check if the stored instance is still active (within the last 5 seconds)
    const fiveSecondsAgo = Date.now() - 5000;
    if (data.timestamp < fiveSecondsAgo) {
      // The stored instance is likely inactive, so we can take over
      localStorage.setItem(ACTIVE_INSTANCE_KEY, JSON.stringify({
        instanceId: INSTANCE_ID,
        timestamp: Date.now()
      }));
      return null;
    }
    
    // Send a message to check if the other instance is still active
    channel?.postMessage({
      type: 'instance_check',
      instanceId: INSTANCE_ID,
      timestamp: Date.now()
    });
    
    // Wait for a response for a short time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check localStorage again to see if it was updated
    const updatedData = localStorage.getItem(ACTIVE_INSTANCE_KEY);
    if (!updatedData) return null;
    
    const updatedParsed = JSON.parse(updatedData);
    
    // If the instance ID changed to ours, no other instance is running
    if (updatedParsed.instanceId === INSTANCE_ID) return null;
    
    // Otherwise, another instance is running
    return updatedParsed.instanceId;
  } catch (error) {
    console.error('Error checking if app is running:', error);
    return null;
  }
};

/**
 * Requests another instance to close
 * @param instanceId The ID of the instance to close
 */
export const requestInstanceToClose = (instanceId: string): void => {
  try {
    channel?.postMessage({
      type: 'close_request',
      targetInstanceId: instanceId,
      requestingInstanceId: INSTANCE_ID,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error requesting instance to close:', error);
  }
};
