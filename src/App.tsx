import React from 'react';
import { Layout } from './components/Layout';
import { ObjectDetection } from './components/ObjectDetection';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Layout>
        <ObjectDetection />
      </Layout>
    </AppProvider>
  );
}

export default App;