import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import type { Book, CreateBookDto, DarBajaBookDto } from '../types';
import Message from '../components/Message';

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | ''; text: string }>({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showDarBajaForm, setShowDarBajaForm] = useState(false);
  const [bookToDarBaja, setBookToDarBaja] = useState<Book | null>(null);
  const [motivo, setMotivo] = useState('');
  const [formData, setFormData] = useState<CreateBookDto>({
    title: '',
    author: '',
    isbn: '',
    stock: 0,
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAll();
      setBooks(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      if (errorMessage.includes('conectar') || errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
        showMessage('error', 'API NO CORRE EN EL URL http://localhost:5095/api');
      } else {
        showMessage('error', 'Book Error: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await bookService.update(editingBook.id, formData);
        showMessage('success', 'Libro actualizado');
      } else {
        await bookService.create(formData);
        showMessage('success', 'Libro creado');
      }
      resetForm();
      loadBooks();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      if (errorMessage.includes('conectar') || errorMessage.includes('Network Error')) {
        showMessage('error', 'No se puede conectar con la API.');
      } else {
        showMessage('error', errorMessage);
      }
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      stock: book.stock,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('El libro se eliminara al confirmar. ¿Estás seguro de confirmar está acción?')) {
      return;
    }
    try {
      await bookService.delete(id);
      showMessage('success', 'Libro eliminado');
      loadBooks();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Error al eliminar el libro');
    }
  };

  const handleDarBajaClick = (book: Book) => {
    if (book.stock <= 0) {
      showMessage('error', 'No se puede dar de baja un libro con stock 0');
      return;
    }
    setBookToDarBaja(book);
    setShowDarBajaForm(true);
    setMotivo('');
  };

  const handleDarBajaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookToDarBaja) return;

    if (!motivo.trim()) {
      showMessage('error', 'Motivo de baja');
      return;
    }

    try {
      const data: DarBajaBookDto = { motivo: motivo.trim() };
      const result = await bookService.darBaja(bookToDarBaja.id, data);
      
      showMessage('success', result.message || 'Libro dado de baja');
      resetDarBajaForm();
      loadBooks(); 
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Error al dar de baja el libro');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      stock: 0,
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const resetDarBajaForm = () => {
    setBookToDarBaja(null);
    setMotivo('');
    setShowDarBajaForm(false);
  };

  return (
    <div className="page">
      <h1>Gestión de Libros</h1>
      <Message type={message.type} text={message.text} />

      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>{editingBook ? 'Editar Libro' : 'Nuevo Libro'}</h3>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Nuevo Libro
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={200}
                />
              </div>
              <div className="form-group">
                <label>Autor *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                  maxLength={20}
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingBook ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      
      {showDarBajaForm && bookToDarBaja && (
        <div className="form-section">
          <h3>Dar de Baja Libro</h3>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            <strong>Libro:</strong> {bookToDarBaja.title} - {bookToDarBaja.author}
            <br />
            <strong>Stock disponible:</strong> {bookToDarBaja.stock}
          </p>
          <form onSubmit={handleDarBajaSubmit}>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Motivo de la Baja *</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                  rows={4}
                  placeholder=""
                  maxLength={500}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-warning">
                Confirmar Dar de Baja
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetDarBajaForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="form-section">
        <h3>Lista de Libros</h3>
        {loading ? (
          <div className="empty-message">Cargando...</div>
        ) : books.length === 0 ? (
          <div className="empty-message">No hay libros registrados</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN</th>
                <th>Stock Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.stock}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-info btn-small"
                        onClick={() => handleEdit(book)}
                      >
                        Editar
                      </button>
                      {book.stock > 0 && (
                        <button
                          className="btn btn-warning btn-small"
                          onClick={() => handleDarBajaClick(book)}
                          title="Dar de baja (solo si stock > 0)"
                        >
                          Dar de Baja
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(book.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BooksPage;

