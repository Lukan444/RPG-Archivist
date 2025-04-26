import { SelectChangeEvent } from '@mui/material';
import React from 'react';

/**
 * A utility function to convert a Material UI SelectChangeEvent to a React.ChangeEvent
 * This is needed because Material UI's SelectChangeEvent is not compatible with React.ChangeEvent
 * @param handler The original event handler that expects a React.ChangeEvent
 * @returns A new event handler that accepts a SelectChangeEvent
 */
export function adaptSelectChangeHandler<T>(
  handler: (event: React.ChangeEvent<{ name?: string; value: unknown }>) => void
): (event: SelectChangeEvent<T>, child: React.ReactNode) => void {
  return (event: SelectChangeEvent<T>, child: React.ReactNode) => {
    // Create a compatible event object
    const adaptedEvent = {
      ...event,
      target: {
        ...event.target,
        value: event.target.value as unknown,
      },
      nativeEvent: new Event('change'),
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
    } as React.ChangeEvent<{ name?: string; value: unknown }>;

    handler(adaptedEvent);
  };
}

/**
 * A utility function to convert a Material UI SelectChangeEvent to a React.ChangeEvent for HTMLInputElement
 * @param handler The original event handler that expects a React.ChangeEvent for HTMLInputElement
 * @returns A new event handler that accepts a SelectChangeEvent
 */
export function adaptSelectChangeHandlerForInput<T>(
  handler: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void
): (event: SelectChangeEvent<T>, child: React.ReactNode) => void {
  return (event: SelectChangeEvent<T>, child: React.ReactNode) => {
    // Create a compatible event object
    const adaptedEvent = {
      ...event,
      target: {
        ...event.target,
        value: event.target.value as unknown,
      },
      nativeEvent: new Event('change'),
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {},
    } as React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>;

    handler(adaptedEvent);
  };
}

/**
 * A utility function to create a type-safe event handler for any component
 * This is a more generic solution that can be used for any event handler type
 */
export function createEventAdapter<
  SourceEvent extends { target: { value: any, name?: string } },
  TargetEvent extends { target: { value: any, name?: string } }
>(
  handler: (event: TargetEvent) => void
): (event: SourceEvent) => void {
  return (event: SourceEvent) => {
    // Create a compatible event object
    const adaptedEvent = {
      ...event,
      target: {
        ...event.target,
        value: event.target.value,
      },
    } as unknown as TargetEvent;

    handler(adaptedEvent);
  };
}
