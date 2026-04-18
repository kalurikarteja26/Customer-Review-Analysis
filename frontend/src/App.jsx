import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProductIngestor from './components/ProductIngestor';
import ProductDisplay from './pages/ProductDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import CatalogGallery from './components/CatalogGallery';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-background text-textMain flex flex-col font-sans selection:bg-primary/30">
          <Navigation />
          
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
            <Routes>
              {/* Home Page Route */}
              <Route path="/" element={
                 <section className="w-full h-auto mt-12 flex flex-col items-center">
                    <div className="w-full max-w-3xl">
                       <ProductIngestor />
                       <CatalogGallery />
                    </div>
                 </section>
              } />

              {/* Dynamic Product Route */}
              <Route path="/product/:productId" element={<ProductDisplay />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
