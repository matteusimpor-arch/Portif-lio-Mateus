import React from 'react';
import { GamesApp } from './GamesApp';

interface ExperimentsAppProps {
  mode?: 'retro' | 'space';
}

export const ExperimentsApp: React.FC<ExperimentsAppProps> = ({ mode = 'retro' }) => {
  return <GamesApp mode={mode} />;
};
