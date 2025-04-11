import React from 'react';
import useFlag from '../hooks/useFlag';

interface FeatureFlagProps {
  name: string;
  children: (enabled: boolean) => React.ReactNode;
  defaultValue?: boolean;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  name,
  children,
  defaultValue = false,
}) => {
  const isEnabled = useFlag(name, defaultValue);
  return <>{children(isEnabled)}</>;
}; 