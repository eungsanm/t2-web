import { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { bookService } from '../services/bookService';
import type { Loan, CreateLoanDto, Book } from '../types';
import Message from '../components/Message';

const LoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | ''; text: string }>({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateLoanDto>({
    bookId: 0,
    studentName: '',
    loanDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    setLoading(true);
    const [loansData, booksData] = await Promise.all([
      loanService.getByStatus('Active'),
      bookService.getAll(),
    ]);

    const loansWithTitles = loansData.map((loan) => {
      const book = booksData.find(b => b.id === loan.bookId);
      return {
        ...loan,
        bookTitle: book ? book.title : `Libro ID: ${loan.bookId}`
      };
    });

    setLoans(loansWithTitles);
    setBooks(booksData);
  } catch (error: any) {
    showMessage('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
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
    
    const selectedBook = books.find(b => b.id === formData.bookId);
    if (!selectedBook) {
      showMessage('error', 'Seleccion un libro');
      return;
    }

    if (selectedBook.stock === 0) {
      showMessage('error', 'Libro sin stock');
      return;
    }

    try {
      await loanService.create(formData);
      showMessage('success', 'Préstamo registrado');
      resetForm();
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al registrar el préstamo';
      if (errorMessage.includes('stock') || errorMessage.includes('Stock')) {
        showMessage('error', 'El libro no tiene stock');
      } else {
        showMessage('error', errorMessage);
      }
    }
  };

  const handleReturn = async (id: number) => {
    if (!window.confirm('¿Seguro de devolver este préstamo?')) {
      return;
    }
    try {
      await loanService.returnLoan(id);
      showMessage('success', 'Préstamo devuelto');
      loadData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Error al devolver el préstamo');
    }
  };

  const resetForm = () => {
    setFormData({
      bookId: 0,
      studentName: '',
      loanDate: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const availableBooks = books.filter(book => book.stock > 0);

  return (
    <div className="page">
      <h1>Gestión de Préstamos</h1>
      <Message type={message.type} text={message.text} />

      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Nuevo Préstamo</h3>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Nuevo Préstamo
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Libro *</label>
                <select
                  value={formData.bookId}
                  onChange={(e) => setFormData({ ...formData, bookId: parseInt(e.target.value) })}
                  required
                >
                  <option value="0">Seleccione un libro</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author} (Stock: {book.stock})
                    </option>
                  ))}
                </select>
                {availableBooks.length === 0 && (
                  <small style={{ color: '#dc3545', marginTop: '5px', display: 'block' }}>
                    No hay libros disponibles con stock
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Nombre del Estudiante *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                  maxLength={150}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Préstamo *</label>
                <input
                  type="date"
                  value={formData.loanDate}
                  onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={availableBooks.length === 0}>
                Registrar Préstamo
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="form-section">
        <h3>Préstamos Activos</h3>
        {loading ? (
          <div className="empty-message">Cargando...</div>
        ) : loans.length === 0 ? (
          <div className="empty-message">No hay préstamos activos</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre del Libro</th>
                <th>Nombre del Estudiante</th>
                <th>Fecha de Préstamo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.bookTitle || `Libro ID: ${loan.bookId}`}</td>
                  <td>{loan.studentName}</td>
                  <td>{new Date(loan.loanDate).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={loan.status === 'Active' ? 'status-scheduled' : 'status-completed'}>
                      {loan.status === 'Active' ? 'Activo' : 'Devuelto'}
                    </span>
                  </td>
                  <td>
                    {loan.status === 'Active' && (
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => handleReturn(loan.id)}
                      >
                        Devolver
                      </button>
                    )}
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

export default LoansPage;

