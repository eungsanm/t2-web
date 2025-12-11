export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  stock: number;
  createdAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  stock: number;
}

export interface Loan {
  id: number;
  bookId: number;
  studentName: string;
  loanDate: string;
  returnDate: string | null;
  status: string;
  createdAt: string;
  bookTitle?: string;
}

export interface CreateLoanDto {
  bookId: number;
  studentName: string;
  loanDate: string;
}

export interface DarBajaBookDto {
  motivo: string;
}

export interface BookDetails {
  book: Book;
  canDarBaja: boolean;
}
