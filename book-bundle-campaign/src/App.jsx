import { useState, useEffect } from 'react';
import Header from './components/Header';
import Testimonials from './components/Testimonials';
import BookGrid from './components/BookGrid';
import StickyBar from './components/StickyBar';
import Footer from './components/Footer';
import BookDetailModal from './components/BookDetailModal';
import { books } from './data/books';

function App() {
  // Use real Shopify data if available, otherwise use mock data
  const [bookData, setBookData] = useState(() => {
    if (window.shopifyBookData && window.shopifyBookData.length > 0) {
      return window.shopifyBookData;
    }
    return books;
  });

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedDetailBook, setSelectedDetailBook] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleBook = (book) => {
    if (selectedBooks.includes(book.id)) {
      setSelectedBooks(prev => prev.filter(id => id !== book.id));
    } else {
      if (selectedBooks.length >= 7) {
        setToastMessage("You can only pick 7 books for this bundle.");
        return;
      }
      setSelectedBooks(prev => [...prev, book.id]);
    }
  };

  // TODO: REPLACE THIS WITH YOUR REAL PRODUCT VARIANT ID FOR THE 7-BOOK BUNDLE
  // You can find this in your Shopify Admin URL for the product variant.
  // Example: .../variants/44665544332211 -> ID is 44665544332211
  // No longer using the single bundle variant ID because we are adding individual items
  // const BUNDLE_VARIANT_ID = 48328424063205;

  const handleCheckout = async () => {
    if (selectedBooks.length !== 7) {
      setToastMessage("Please select exactly 7 books.");
      return;
    }

    try {
      // 1. Prepare items for cart (7 individual books)
      const items = selectedBooks.map(bookId => {
        const book = bookData.find(b => b.id === bookId);
        // Use variantId if available, fall back to id for dev/mock but that won't work in real Shopify cart
        return {
          id: book?.variantId,
          quantity: 1
        };
      });

      // Validate we have IDs
      if (items.some(i => !i.id)) {
        setToastMessage("Error: Some books are missing Variant IDs.");
        console.error("Missing variant IDs for books:", selectedBooks);
        return;
      }

      // 2. Add to Cart via Shopify AJAX API
      const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items
        })
      });

      if (response.ok) {
        // 3. Redirect to Checkout
        window.location.href = '/checkout';
      } else {
        const errorData = await response.json();
        console.error("Cart Error:", errorData);
        setToastMessage("Error adding to cart. Check console.");
        alert("Error: Could not add bundle to cart. potentially missing Variant ID configuration.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      // Fallback for development/testing outside Shopify
      if (!window.Shopify) {
        alert(`[DEV MODE] Would checkout with books: \n${selectedBooks.join('\n')}`);
      } else {
        setToastMessage("Network error. Please try again.");
      }
    }
  };

  const handleReset = () => {
    setSelectedBooks([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      <Header />
      <Testimonials />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookGrid
          books={bookData}
          selectedIds={selectedBooks}
          onToggle={handleToggleBook}
          onDetail={setSelectedDetailBook}
        />
      </main>

      <Footer />

      <StickyBar
        count={selectedBooks.length}
        onCheckout={handleCheckout}
        onReset={handleReset}
      />

      <BookDetailModal
        book={selectedDetailBook}
        isOpen={!!selectedDetailBook}
        onClose={() => setSelectedDetailBook(null)}
        isSelected={selectedDetailBook ? selectedBooks.includes(selectedDetailBook.id) : false}
        onToggle={handleToggleBook}
      />

      {/* Toast Notification */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
      >
        <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-xl font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {toastMessage}
        </div>
      </div>
    </div>
  );
}

export default App;
