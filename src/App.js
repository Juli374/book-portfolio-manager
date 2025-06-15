import React, { useState, useEffect } from 'react';
import { Plus, Edit, ExternalLink, Upload } from 'lucide-react';

const BookPortfolioManager = () => {
  const [books, setBooks] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('us');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const markets = [
    { code: 'us', name: 'США (+ UK, AU, CA)', flag: '🇺🇸' },
    { code: 'de', name: 'Германия', flag: '🇩🇪' }
  ];

  const englishMarkets = ['us', 'uk', 'au', 'ca'];

  const authors = [
    'Polly Olson',
    'Taylor Grant', 
    'Ariel Mullins',
    'Dr. Rosemary Richardson',
    'Caleb North'
  ];

  const accounts = [
    'Yulii',
    'Alex'
  ];

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    bookType: 'english',
    price: '',
    amazonLink: '',
    websiteLink: '',
    portfolioName: '',
    coverImage: '',
    status: 'active',
    account: 'Yulii'
  });

  // Автоматически устанавливаем тип книги в зависимости от выбранного рынка
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bookType: selectedMarket === 'de' ? 'german' : 'english'
    }));
  }, [selectedMarket]);

  // Загрузка данных из localStorage или создание примеров
  useEffect(() => {
    const savedBooks = localStorage.getItem('amazonBooks');
    
    if (savedBooks) {
      try {
        setBooks(JSON.parse(savedBooks));
      } catch (error) {
        console.error('Error parsing saved books:', error);
        createSampleBooks();
      }
    } else {
      createSampleBooks();
    }
  }, []);

  const createSampleBooks = () => {
    const sampleBooks = [
      {
        id: 'sample1_us',
        baseId: 'sample1',
        title: 'The Success Mindset',
        author: 'Polly Olson',
        market: 'us',
        price: '12.99',
        currency: '$',
        amazonLink: 'https://amazon.com/dp/example1',
        websiteLink: 'https://example-website.com',
        portfolioName: 'Business Books',
        coverImage: '',
        status: 'active',
        account: 'Yulii',
        bookType: 'english',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample2_de',
        baseId: 'sample2',
        title: 'Der Erfolgs Mindset',
        author: 'Dr. Rosemary Richardson',
        market: 'de',
        price: '14.99',
        currency: '€',
        amazonLink: 'https://amazon.de/dp/example2',
        websiteLink: 'https://example-website-de.com',
        portfolioName: 'Business Bücher',
        coverImage: '',
        status: 'active',
        account: 'Alex',
        bookType: 'german',
        createdAt: new Date().toISOString()
      }
    ];
    setBooks(sampleBooks);
    localStorage.setItem('amazonBooks', JSON.stringify(sampleBooks));
  };

  // Сохранение в localStorage при изменении книг (с debounce)
  useEffect(() => {
    if (books.length > 0) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('amazonBooks', JSON.stringify(books));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          // Если localStorage переполнен, показываем предупреждение
          if (error.name === 'QuotaExceededError') {
            alert('Хранилище браузера переполнено. Рекомендуется экспортировать данные и очистить старые записи.');
          }
        }
      }, 500); // Задержка в 500мс
      
      return () => clearTimeout(timeoutId);
    }
  }, [books]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, coverImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addBook = () => {
    if (!formData.title || !formData.author) {
      alert('Пожалуйста, заполните название книги и выберите автора');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const baseId = Date.now();
      const newBooks = [];

      if (formData.bookType === 'english') {
        // Создаем книгу только для US, но с пометкой что она на всех англоязычных рынках
        newBooks.push({
          id: `${baseId}_us`,
          baseId: baseId,
          title: formData.title,
          author: formData.author,
          market: 'us',
          price: formData.price,
          currency: '$',
          amazonLink: formData.amazonLink,
          websiteLink: formData.websiteLink,
          portfolioName: formData.portfolioName,
          coverImage: formData.coverImage,
          status: formData.status,
          account: formData.account,
          bookType: 'english',
          createdAt: new Date().toISOString()
        });
      } else {
        // Создаем книгу только для немецкого рынка
        newBooks.push({
          id: `${baseId}_de`,
          baseId: baseId,
          title: formData.title,
          author: formData.author,
          market: 'de',
          price: formData.price,
          currency: '€',
          amazonLink: formData.amazonLink,
          websiteLink: formData.websiteLink,
          portfolioName: formData.portfolioName,
          coverImage: formData.coverImage,
          status: formData.status,
          account: formData.account,
          bookType: 'german',
          createdAt: new Date().toISOString()
        });
      }
      
      // Добавляем книги пакетно
      const updatedBooks = [...books, ...newBooks];
      setBooks(updatedBooks);
      
      // Сохраняем с задержкой для избежания блокировки UI
      setTimeout(() => {
        try {
          localStorage.setItem('amazonBooks', JSON.stringify(updatedBooks));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        setIsLoading(false);
      }, 200);
      
      resetForm();
      
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Произошла ошибка при добавлении книги. Попробуйте еще раз.');
      setIsLoading(false);
    }
  };

  const updateBook = () => {
    try {
      const updatedBooks = books.map(book => 
        book.id === editingBook.id ? { ...book, ...formData } : book
      );
      setBooks(updatedBooks);
      
      // Сохраняем с задержкой
      setTimeout(() => {
        try {
          localStorage.setItem('amazonBooks', JSON.stringify(updatedBooks));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }, 100);
      
      resetForm();
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Произошла ошибка при обновлении книги. Попробуйте еще раз.');
    }
  };

  const toggleBookStatus = (bookId) => {
    try {
      const updatedBooks = books.map(book => 
        book.id === bookId 
          ? { ...book, status: book.status === 'active' ? 'archive' : 'active' }
          : book
      );
      setBooks(updatedBooks);
      
      // Сохраняем с задержкой
      setTimeout(() => {
        try {
          localStorage.setItem('amazonBooks', JSON.stringify(updatedBooks));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error toggling book status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      bookType: selectedMarket === 'de' ? 'german' : 'english',
      price: '',
      amazonLink: '',
      websiteLink: '',
      portfolioName: '',
      coverImage: '',
      status: 'active',
      account: 'Yulii'
    });
    setShowAddForm(false);
    setEditingBook(null);
  };

  const editBook = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      amazonLink: book.amazonLink || '',
      websiteLink: book.websiteLink || '',
      portfolioName: book.portfolioName,
      coverImage: book.coverImage,
      status: book.status || 'active',
      account: book.account || 'Yulii'
    });
    setEditingBook(book);
    setShowAddForm(true);
  };

  const filteredBooks = books.filter(book => book.market === selectedMarket);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Портфолио книг Amazon</h1>
        
        {/* Вкладки рынков */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {markets.map(market => (
            <button
              key={market.code}
              onClick={() => setSelectedMarket(market.code)}
              className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${
                selectedMarket === market.code
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {market.flag} {market.name}
            </button>
          ))}
        </div>

        {/* Панель управления */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Добавить книгу
          </button>
        </div>

        {/* Форма добавления/редактирования */}
        {showAddForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingBook ? 'Редактировать книгу' : 'Добавить новую книгу'}
            </h3>
            
            {!editingBook && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип книги
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="english"
                      checked={formData.bookType === 'english'}
                      onChange={(e) => setFormData({...formData, bookType: e.target.value})}
                      className="mr-2"
                    />
                    Английская (США + Англия + Австралия + Канада)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="german"
                      checked={formData.bookType === 'german'}
                      onChange={(e) => setFormData({...formData, bookType: e.target.value})}
                      className="mr-2"
                    />
                    Немецкая (только Германия)
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Название книги"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <select
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-transparent outline-none"
                >
                  <option value="">Выберите автора</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>
              
              <input
                type="number"
                placeholder={selectedMarket === 'de' ? 'Цена (€)' : 'Цена ($)'}
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                placeholder="Название портфолио"
                value={formData.portfolioName}
                onChange={(e) => setFormData({...formData, portfolioName: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-transparent outline-none"
                >
                  <option value="active">Активно</option>
                  <option value="archive">Архив</option>
                </select>
              </div>
              
              <div className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <select
                  value={formData.account}
                  onChange={(e) => setFormData({...formData, account: e.target.value})}
                  className="w-full bg-transparent outline-none"
                >
                  {accounts.map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="url"
                placeholder="Ссылка на Amazon"
                value={formData.amazonLink}
                onChange={(e) => setFormData({...formData, amazonLink: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="Ссылка на сайт книги"
                value={formData.websiteLink}
                onChange={(e) => setFormData({...formData, websiteLink: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Обложка книги
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              {formData.coverImage && (
                <img 
                  src={formData.coverImage} 
                  alt="Preview" 
                  className="mt-2 w-20 h-28 object-cover rounded"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingBook ? updateBook : addBook}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Добавление...
                  </>
                ) : (
                  editingBook ? 'Обновить' : 'Добавить'
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Информация о текущем рынке */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            {markets.find(m => m.code === selectedMarket)?.flag}
            {markets.find(m => m.code === selectedMarket)?.name}
            <span className="text-lg text-gray-500">({filteredBooks.length} книг)</span>
          </h2>
          
          {selectedMarket === 'us' && (
            <p className="text-sm text-gray-600 mt-2">
              📚 Здесь показаны английские книги (доступны на всех англоязычных рынках: США, Великобритания, Австралия, Канада)
            </p>
          )}
        </div>

        {/* Галерея книг */}
        <div className="flex flex-wrap gap-4 justify-start">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-56">
              <div className="h-80 bg-gray-100 flex items-center justify-center p-2">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Upload size={32} />
                    <p className="mt-2 text-sm">Нет обложки</p>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2" title={book.title}>
                  {book.title}
                </h3>
                <p className="text-gray-600 text-xs mb-2">
                  {book.author}
                </p>
                
                {book.portfolioName && (
                  <p className="text-gray-500 text-xs mb-2 truncate" title={book.portfolioName}>
                    {book.portfolioName}
                  </p>
                )}
                
                {/* Аккаунт */}
                <div className="mb-2">
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: book.account === 'Yulii' ? '#dbeafe' : '#e0e7ff',
                      color: book.account === 'Yulii' ? '#1e40af' : '#3730a3'
                    }}
                  >
                    📱 {book.account || 'Yulii'}
                  </span>
                </div>
                
                {book.price && (
                  <div className="text-sm mb-3">
                    <span className="font-bold text-green-600">
                      {book.currency || (book.market === 'de' ? '€' : '$')}{book.price}
                    </span>
                  </div>
                )}
                
                {/* Статус книги */}
                <div className="mb-3">
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: book.status === 'active' ? '#dcfce7' : '#f3f4f6',
                      color: book.status === 'active' ? '#166534' : '#374151'
                    }}
                  >
                    {book.status === 'active' ? 'Активно' : 'Архив'}
                  </span>
                </div>
                
                {/* Кнопки ссылок */}
                <div className="mb-3" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {book.amazonLink && book.amazonLink.trim() !== '' && (
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '100%',
                        backgroundColor: '#f97316',
                        color: 'white',
                        fontWeight: '600',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#ea580c'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f97316'}
                    >
                      <ExternalLink size={16} />
                      Посмотреть на Amazon
                    </a>
                  )}
                  
                  {book.websiteLink && book.websiteLink.trim() !== '' && (
                    <a
                      href={book.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '100%',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        fontWeight: '600',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                    >
                      <ExternalLink size={16} />
                      Перейти на сайт
                    </a>
                  )}
                </div>
                
                {/* Кнопки управления */}
                <div className="flex gap-2">
                  <button
                    onClick={() => editBook(book)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Редактировать"
                  >
                    <Edit size={12} />
                    Изменить
                  </button>
                  <button
                    onClick={() => toggleBookStatus(book.id)}
                    style={{
                      backgroundColor: book.status === 'active' ? '#6b7280' : '#10b981',
                      color: 'white'
                    }}
                    className="flex-1 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1 hover:opacity-80"
                    title={book.status === 'active' ? 'В архив' : 'Активировать'}
                  >
                    {book.status === 'active' ? '📁 Архив' : '✅ Активно'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Нет книг для рынка {markets.find(m => m.code === selectedMarket)?.name}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Добавить книгу
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPortfolioManager;
