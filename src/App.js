import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Upload } from 'lucide-react';

const BookPortfolioManager = () => {
  const [books, setBooks] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('us');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const markets = [
    { code: 'us', name: 'США', flag: '🇺🇸' },
    { code: 'uk', name: 'Великобритания', flag: '🇬🇧' },
    { code: 'au', name: 'Австралия', flag: '🇦🇺' },
    { code: 'ca', name: 'Канада', flag: '🇨🇦' },
    { code: 'de', name: 'Германия', flag: '🇩🇪' }
  ];

  const englishMarkets = ['us', 'uk', 'au', 'ca'];

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    bookType: 'english', // 'english' или 'german'
    price: '',
    amazonLink: '',
    portfolioName: '',
    coverImage: ''
  });

  const [calculatorData, setCalculatorData] = useState({
    price: '',
    cost: '',
    adSpend: '',
    sales: ''
  });

  // Инициализация с данными из localStorage или примерами
  useEffect(() => {
    // Загружаем данные из localStorage
    const savedBooks = localStorage.getItem('amazonBooks');
    
    if (savedBooks) {
      // Если есть сохраненные данные, загружаем их
      setBooks(JSON.parse(savedBooks));
    } else {
      // Если нет сохраненных данных, добавляем примеры
      const sampleBooks = [
        {
          id: 'sample1_us',
          baseId: 'sample1',
          title: 'The Success Mindset',
          author: 'John Smith',
          market: 'us',
          price: '12.99',
          amazonLink: 'https://amazon.com/dp/example1',
          portfolioName: 'Business Books',
          coverImage: '',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample1_uk',
          baseId: 'sample1',
          title: 'The Success Mindset',
          author: 'John Smith',
          market: 'uk',
          price: '9.99',
          amazonLink: 'https://amazon.co.uk/dp/example1',
          portfolioName: 'Business Books',
          coverImage: '',
          createdAt: new Date().toISOString()
        }
      ];
      setBooks(sampleBooks);
      // Сохраняем примеры в localStorage
      localStorage.setItem('amazonBooks', JSON.stringify(sampleBooks));
    }
  }, []);

  // Сохраняем в localStorage при каждом изменении книг
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('amazonBooks', JSON.stringify(books));
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
    if (!formData.title || !formData.author) return;
    
    const baseId = Date.now();
    const newBooks = [];

    if (formData.bookType === 'english') {
      // Создаем книгу для всех англоязычных рынков
      englishMarkets.forEach(market => {
        newBooks.push({
          id: `${baseId}_${market}`,
          baseId: baseId,
          title: formData.title,
          author: formData.author,
          market: market,
          price: formData.price,
          amazonLink: formData.amazonLink,
          portfolioName: formData.portfolioName,
          coverImage: formData.coverImage,
          createdAt: new Date().toISOString()
        });
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
        amazonLink: formData.amazonLink,
        portfolioName: formData.portfolioName,
        coverImage: formData.coverImage,
        createdAt: new Date().toISOString()
      });
    }
    
    setBooks([...books, ...newBooks]);
    resetForm();
  };

  const updateBook = () => {
    setBooks(books.map(book => 
      book.id === editingBook.id ? { ...book, ...formData } : book
    ));
    resetForm();
  };

  const deleteBookGroup = (baseId) => {
    setBooks(books.filter(book => book.baseId !== baseId));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      bookType: 'english',
      price: '',
      amazonLink: '',
      portfolioName: '',
      coverImage: ''
    });
    setShowAddForm(false);
    setEditingBook(null);
  };

  const editBook = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      amazonLink: book.amazonLink,
      portfolioName: book.portfolioName,
      coverImage: book.coverImage
    });
    setEditingBook(book);
    setShowAddForm(true);
  };

  const filteredBooks = books.filter(book => book.market === selectedMarket);

  // Получаем уникальные группы книг для текущего рынка
  const getUniqueBookGroups = () => {
    const seen = new Set();
    return filteredBooks.filter(book => {
      if (seen.has(book.baseId)) {
        return false;
      }
      seen.add(book.baseId);
      return true;
    });
  };

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
                    Английская (США, Англия, Австралия, Канада)
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
              <input
                type="text"
                placeholder="Автор"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Цена ($)"
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
            </div>
            
            <div className="mb-4">
              <input
                type="url"
                placeholder="Ссылка на Amazon"
                value={formData.amazonLink}
                onChange={(e) => setFormData({...formData, amazonLink: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {editingBook ? 'Обновить' : 'Добавить'}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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
                
                {book.price && (
                  <div className="text-sm mb-3">
                    <span className="font-bold text-green-600">${book.price}</span>
                  </div>
                )}
                
                {/* Кнопка Amazon отдельно */}
                {book.amazonLink && (
                  <div className="mb-3">
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Купить на Amazon
                    </a>
                  </div>
                )}
                
                {/* Кнопки управления */}
                <div className="flex gap-2">
                  <button
                    onClick={() => editBook(book)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Редактировать"
                  >
                    <Edit size={12} />
                    Изменить
                  </button>
                  <button
                    onClick={() => deleteBookGroup(book.baseId)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Удалить со всех рынков"
                  >
                    <Trash2 size={12} />
                    Удалить
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
