import { create } from 'zustand';
import type { BookInfo, PageData, BookState, ReflowSettings } from '../types/book.types';


interface BookStore extends BookState {
  pagesByBookId: Record<string, PageData[]>;
  // Actions
  createBook: (book: Omit<BookInfo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBook: (id: string, updates: Partial<BookInfo>) => void;
  deleteBook: (id: string) => void;
  setCurrentBook: (id: string) => void;
  setPages: (pages: PageData[]) => void;
  addPage: (page: PageData) => void;
  updatePage: (id: string, updates: Partial<PageData>) => void;
  deletePage: (id: string) => void;
  setReflowSettings: (settings: Partial<ReflowSettings>) => void;
  syncContent: (sourceMode: 'reflow' | 'fixed', targetMode: 'reflow' | 'fixed') => void;
  importBook: (bookData: {
    title?: string;
    author?: string;
    pages?: Array<{
      name?: string;
      content?: string;
      styles?: Record<string, unknown>;
    }>;
  }) => void;
  resetStore: () => void;
  setCurrentPageId: (id: string | null) => void;
}

// Mock Data
const MOCK_BOOKS: BookInfo[] = [
  {
    id: 'book-1',
    title: 'Thơ ca Đời sống',
    author: 'Nguyễn Văn A',
    layoutMode: 'fixed',
    template: 'A4_PORTRAIT',
    pageSize: { width: 210, height: 297, unit: 'mm' },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop&q=80',
    styles: `
      /* Poetry Book Styles */
      .poetry-cover {
        height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;
      }
      .poetry-cover-title { font-size: 3em; margin: 0 0 20px 0; font-family: 'Georgia', serif; }
      .poetry-cover-author { font-size: 1.5em; margin: 10px 0; opacity: 0.9; }
      .poetry-cover-subtitle { font-size: 1em; margin: 30px 0 0 0; opacity: 0.7; }
      .poetry-toc { padding: 60px 40px; font-family: 'Georgia', serif; }
      .poetry-toc-title { text-align: center; font-size: 2em; margin-bottom: 40px; color: #667eea; }
      .poetry-toc-list { line-height: 2; font-size: 1.1em; }
      .poetry-toc-item { border-bottom: 1px dotted #ccc; padding: 10px 0; }
      .poetry-content { padding: 60px 50px; font-family: 'Georgia', serif; line-height: 1.8; }
      .poetry-title { text-align: center; color: #667eea; font-size: 1.8em; margin-bottom: 30px; }
      .poetry-verse { text-indent: 2em; margin: 15px 0; }
      .poetry-quote-page {
        padding: 40px; text-align: center; background: #f9f9f9; height: 100%;
        display: flex; flex-direction: column; justify-content: center;
      }
      .poetry-quote-box {
        background: #667eea; color: white; padding: 100px 40px;
        margin: 0 auto; max-width: 600px; border-radius: 10px;
      }
      .poetry-quote-text { font-size: 1.5em; font-style: italic; }
    `
  },
  {
    id: 'book-2',
    title: 'Tạp chí Thời trang',
    author: 'Le Thi B',
    layoutMode: 'fixed',
    template: 'A4_PORTRAIT',
    pageSize: { width: 210, height: 297, unit: 'mm' },
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-05'),
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&q=80',
    styles: `
      /* Fashion Magazine Styles */
      .magazine-cover {
        height: 100%; background: #000; color: white; display: flex;
        flex-direction: column; justify-content: space-between; padding: 60px 40px;
      }
      .magazine-cover-label { font-size: 0.9em; letter-spacing: 3px; color: #ff6b9d; }
      .magazine-cover-title { font-size: 4em; margin: 0; line-height: 1; font-weight: 900; }
      .magazine-cover-year { font-size: 3em; margin: 10px 0 0 0; color: #ff6b9d; font-weight: 900; }
      .magazine-cover-footer { display: flex; justify-content: space-between; font-size: 0.85em; opacity: 0.8; }
      .magazine-contents { padding: 60px 50px; background: #fafafa; }
      .magazine-contents-title { font-size: 2.5em; margin-bottom: 40px; font-weight: 900; }
      .magazine-contents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 1em; }
      .magazine-contents-item { border-left: 3px solid #ff6b9d; padding-left: 20px; }
      .magazine-contents-item.alt { border-left-color: #000; }
      .magazine-contents-item-title { font-weight: bold; margin: 0; }
      .magazine-contents-item-desc { color: #666; margin: 5px 0 0 0; font-size: 0.9em; }
      .magazine-article { padding: 60px 50px; }
      .magazine-article-label { color: #ff6b9d; font-size: 0.9em; letter-spacing: 2px; font-weight: bold; }
      .magazine-article-title { font-size: 3em; margin: 10px 0 30px 0; font-weight: 900; line-height: 1.1; }
      .magazine-article-columns { columns: 2; column-gap: 40px; font-size: 1em; line-height: 1.7; }
      .magazine-article-columns p:first-child { margin-top: 0; }
      .magazine-dark-page { background: #000; color: white; padding: 60px 50px; height: 100%; }
      .magazine-dark-title { font-size: 2.5em; margin: 0 0 30px 0; font-weight: 900; }
      .magazine-dark-text { font-size: 1.2em; line-height: 1.7; color: #ddd; }
      .magazine-quote-box { margin-top: 40px; padding: 30px; border-left: 4px solid #ff6b9d; }
      .magazine-quote-text { font-style: italic; font-size: 1.1em; color: #ff6b9d; margin: 0; }
      .magazine-quote-author { margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.7; }
      .magazine-gradient-page { padding: 60px 50px; background: linear-gradient(to bottom, #fff9f0 0%, #ffe6f0 100%); }
      .magazine-product-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
      .magazine-product-card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
      .magazine-product-title { margin: 0 0 15px 0; color: #ff6b9d; }
      .magazine-product-desc { margin: 0; line-height: 1.6; color: #666; }
    `
  },
  {
    id: 'book-3',
    title: 'Tiểu thuyết Trinh thám',
    author: 'Tran Van C',
    layoutMode: 'reflow',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-10'),
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&q=80',
    styles: `
      /* Detective Novel Styles */
      .novel-chapter { padding: 60px 50px; font-family: 'Georgia', serif; }
      .novel-chapter.alt-bg { background: #fafafa; }
      .novel-chapter-number { font-size: 2.5em; margin: 0 0 10px 0; color: #2c3e50; }
      .novel-chapter-title { font-size: 1.5em; margin: 0 0 40px 0; color: #7f8c8d; font-weight: normal; }
      .novel-paragraph { text-indent: 2em; line-height: 1.8; font-size: 1.1em; margin-bottom: 20px; }
      .novel-quote { text-align: center; font-style: italic; color: #7f8c8d; margin: 30px 0; }
      .novel-info-box { background: #ecf0f1; padding: 30px; margin: 30px 0; border-left: 5px solid #3498db; }
      .novel-info-text { margin: 0; font-style: italic; color: #2c3e50; }
      .novel-cliffhanger { text-align: center; margin: 40px 0; padding: 30px; background: #2c3e50; color: white; }
      .novel-cliffhanger-text { font-size: 1.3em; margin: 0;font-style: italic; }
      .novel-cliffhanger-subtitle { margin: 10px 0 0 0; opacity: 0.7; }
    `
  }
];

const MOCK_PAGES: Record<string, PageData[]> = {
  'book-1': [
    { 
      id: 'p1-1', 
      name: 'Bìa', 
      pageNumber: 1, 
      type: 'cover', 
      content: `
        <div class="poetry-cover">
          <h1 class="poetry-cover-title">Thơ ca Đời sống</h1>
          <p class="poetry-cover-author">Nguyễn Văn A</p>
          <p class="poetry-cover-subtitle">Tuyển tập thơ 2024</p>
        </div>
      `
    },
    { 
      id: 'p1-2', 
      name: 'Mục lục', 
      pageNumber: 2, 
      type: 'content', 
      content: `
        <div class="poetry-toc">
          <h2 class="poetry-toc-title">Mục lục</h2>
          <div class="poetry-toc-list">
            <p class="poetry-toc-item">1. Mùa thu lá vàng .................... 3</p>
            <p class="poetry-toc-item">2. Chiều quê .......................... 5</p>
            <p class="poetry-toc-item">3. Hồi ức ............................. 7</p>
            <p class="poetry-toc-item">4. Nơi xa .............................. 9</p>
          </div>
        </div>
      `
    },
    { 
      id: 'p1-3', 
      name: 'Mùa thu lá vàng', 
      pageNumber: 3, 
      type: 'content', 
      content: `
        <div class="poetry-content">
          <h3 class="poetry-title">Mùa thu lá vàng</h3>
          <p class="poetry-verse">Chiều thu lá vàng rơi đầy sân</p>
          <p class="poetry-verse">Gió lay nhẹ nhàng trên cành cây</p>
          <p class="poetry-verse">Nhớ người xưa giờ đã xa vời</p>
          <p class="poetry-verse">Chỉ còn trong tim những kỷ niệm đầy</p>
          <br/>
          <p class="poetry-verse">Lòng hoen ố như lá úa màu</p>
          <p class="poetry-verse">Thời gian trôi mãi không quay đầu</p>
          <p class="poetry-verse">Mùa thu này, lại một mình ta</p>
          <p class="poetry-verse">Ngắm lá vàng rơi, đợi chờ ai...</p>
        </div>
      `
    },
    { 
      id: 'p1-4', 
      name: 'Ảnh minh họa', 
      pageNumber: 4, 
      type: 'content', 
      content: `
        <div class="poetry-quote-page">
          <div class="poetry-quote-box">
            <p class="poetry-quote-text">"Mùa thu là thời điểm tâm hồn trở nên sâu lắng..."</p>
          </div>
        </div>
      `
    },
    { 
      id: 'p1-5', 
      name: 'Chiều quê', 
      pageNumber: 5, 
      type: 'content', 
      content: `
        <div class="poetry-content">
          <h3 class="poetry-title">Chiều quê</h3>
          <p class="poetry-verse">Chiều quê thanh bình khói tỏa mờ</p>
          <p class="poetry-verse">Tiếng chim bay về trong gió nhẹ</p>
          <p class="poetry-verse">Con đường đất đỏ, bước chân về</p>
          <p class="poetry-verse">Hương lúa mới thoang thoảng trong gió</p>
        </div>
      `
    }
  ],
  'book-2': [
    { 
      id: 'p2-1', 
      name: 'Cover', 
      pageNumber: 1, 
      type: 'cover', 
      content: `
        <div class="magazine-cover">
          <div>
            <p class="magazine-cover-label">FASHION WEEKLY</p>
          </div>
          <div>
            <h1 class="magazine-cover-title">THỜI TRANG</h1>
            <h2 class="magazine-cover-year">2024</h2>
          </div>
          <div class="magazine-cover-footer">
            <span>SPRING COLLECTION</span>
            <span>ISSUE 03</span>
          </div>
        </div>
      `
    },
    { 
      id: 'p2-2', 
      name: 'Contents', 
      pageNumber: 2, 
      type: 'content', 
      content: `
        <div class="magazine-contents">
          <h2 class="magazine-contents-title">CONTENTS</h2>
          <div class="magazine-contents-grid">
            <div class="magazine-contents-item">
              <p class="magazine-contents-item-title">04 | XU HƯỚNG 2024</p>
              <p class="magazine-contents-item-desc">Những màu sắc và phong cách thống trị</p>
            </div>
            <div class="magazine-contents-item alt">
              <p class="magazine-contents-item-title">08 | STREET STYLE</p>
              <p class="magazine-contents-item-desc">Phong cách đường phố từ Paris đến Tokyo</p>
            </div>
            <div class="magazine-contents-item">
              <p class="magazine-contents-item-title">12 | PHONG CÁCH CÁ NHÂN</p>
              <p class="magazine-contents-item-desc">Làm thế nào để tạo dựng phong cách riêng</p>
            </div>
            <div class="magazine-contents-item alt">
              <p class="magazine-contents-item-title">16 | MÙA XUÂN TƯƠI MỚI</p>
              <p class="magazine-contents-item-desc">Bộ sưu tập mùa xuân đầy màu sắc</p>
            </div>
          </div>
        </div>
      `
    },
    { 
      id: 'p2-3', 
      name: 'Xu hướng 2024', 
      pageNumber: 3, 
      type: 'content', 
      content: `
        <div class="magazine-article">
          <span class="magazine-article-label">TRENDS</span>
          <h2 class="magazine-article-title">XU HƯỚNG<br/>THỜI TRANG 2024</h2>
          <div class="magazine-article-columns">
            <p><strong>Màu sắc tươi sáng</strong> - Năm 2024 đánh dấu sự trở lại mạnh mẽ của các gam màu rực rỡ. Từ hồng neon đến xanh cobalt, các nhà thiết kế không ngại thử nghiệm với bảng màu táo bạo.</p>
            <p><strong>Phong cách tối giản</strong> - Xu hướng minimalism tiếp tục thống trị với các đường nét đơn giản, thanh lịch. Less is more vẫn là phương châm được nhiều fashionista theo đuổi.</p>
            <p><strong>Bền vững</strong> - Thời trang xanh không còn là lựa chọn mà trở thành tiêu chuẩn. Vật liệu tái chế và quy trình sản xuất thân thiện môi trường ngày càng được ưu tiên.</p>
          </div>
        </div>
      `
    },
    { 
      id: 'p2-4', 
      name: 'Street Style', 
      pageNumber: 4, 
      type: 'content', 
      content: `
        <div class="magazine-dark-page">
          <h2 class="magazine-dark-title">STREET STYLE</h2>
          <p class="magazine-dark-text">
            Phong cách đường phố không chỉ là cách ăn mặc, mà còn là một tuyên ngôn về cá tính. 
            Từ những con phố Paris lãng mạn đến Tokyo năng động, chúng ta chứng kiến sự pha trộn 
            độc đáo giữa truyền thống và hiện đại.
          </p>
          <div class="magazine-quote-box">
            <p class="magazine-quote-text">
              "Fashion is about dressing according to what's fashionable. Style is more about being yourself."
            </p>
            <p class="magazine-quote-author">- Oscar de la Renta</p>
          </div>
        </div>
      `
    },
    { 
      id: 'p2-5', 
      name: 'Spring Collection', 
      pageNumber: 5, 
      type: 'content', 
      content: `
        <div class="magazine-gradient-page">
          <span class="magazine-article-label">NEW COLLECTION</span>
          <h2 class="magazine-article-title">MÙA XUÂN TƯƠI MỚI</h2>
          <p class="magazine-dark-text">
            Bộ sưu tập xuân 2024 mang đến làn gió mới với những thiết kế nhẹ nhàng, 
            thoáng mát. Chất liệu vải linen, cotton pha trộn cùng những họa tiết hoa nhí 
            tạo nên vẻ đẹp thanh thoát, nữ tính.
          </p>
          <div class="magazine-product-grid">
            <div class="magazine-product-card">
              <h4 class="magazine-product-title">Váy maxi hoa</h4>
              <p class="magazine-product-desc">Thiết kế xòe nhẹ, thoải mái cho những ngày hè oi ả</p>
            </div>
            <div class="magazine-product-card">
              <h4 class="magazine-product-title">Áo sơ mi linen</h4>
              <p class="magazine-product-desc">Chất liệu thoáng mát, phù hợp cho môi trường công sở</p>
            </div>
          </div>
        </div>
      `
    }
  ],
  'book-3': [
    { 
      id: 'p3-1', 
      name: 'Chương 1: Bí ẩn bắt đầu', 
      pageNumber: 1, 
      type: 'content', 
      content: `
        <div class="novel-chapter">
          <h2 class="novel-chapter-number">Chương 1</h2>
          <h3 class="novel-chapter-title">Bí ẩn bắt đầu</h3>
          <p class="novel-paragraph">
            Đêm tối bao trùm thành phố, chỉ có ánh đèn đường le lói tỏa sáng trên những con phố vắng vẻ. 
            Thám tử Minh đứng trước tòa nhà cũ kỹ, nơi vụ án mạng kỳ lạ vừa xảy ra. Gió lạnh thổi qua, 
            mang theo mùi mưa sắp đến.
          </p>
          <p class="novel-paragraph">
            "Một vụ án khác," anh thầm nghĩ, "nhưng vụ này có gì đó khác thường."
          </p>
          <p class="novel-paragraph">
            Căn phòng trên tầng ba, nơi nạn nhân được phát hiện, vẫn còn nguyên hiện trường. 
            Cửa sổ mở toang, rem cửa bay phấp phới. Nhưng điều kỳ lạ là không có dấu hiệu đột nhập. 
            Mọi thứ đều được khóa cẩn thận từ bên trong.
          </p>
          <p class="novel-paragraph">
            Trên bàn làm việc, một lá thư viết tay vẫn còn đó. Nét chữ nguệch ngoạc, có vẻ như được viết 
            trong vội vã. Thám tử Minh nhặt lá thư lên, đọc dòng chữ cuối cùng:
          </p>
          <p class="novel-quote">
            "Họ đã tìm ra tôi..."
          </p>
        </div>
      `
    },
    { 
      id: 'p3-2', 
      name: 'Chương 2: Manh mối đầu tiên', 
      pageNumber: 2, 
      type: 'content', 
      content: `
        <div class="novel-chapter">
          <h2 class="novel-chapter-number">Chương 2</h2>
          <h3 class="novel-chapter-title">Manh mối đầu tiên</h3>
          <p class="novel-paragraph">
            Sáng hôm sau, thám tử Minh quay lại hiện trường với tâm trí tươi mới hơn. Ánh nắng mai chiếu qua 
            cửa sổ, tạo nên những vệt sáng trên sàn gỗ cũ kỹ. Anh bắt đầu kiểm tra kỹ lưỡng từng chi tiết 
            nhỏ trong căn phòng.
          </p>
          <p class="novel-paragraph">
            Dưới chiếc ghế sofa, anh phát hiện một mảnh giấy nhỏ. Trên đó có một dãy số: <strong>7-14-21-28</strong>. 
            Có vẻ như đây là một loại mật mã nào đó. Nhưng ý nghĩa của nó là gì?
          </p>
          <p class="novel-paragraph">
            Điện thoại reo lên. Đó là cuộc gọi từ cảnh sát trưởng.
          </p>
          <p class="novel-paragraph">
            "Minh à, chúng tôi vừa tìm thấy thêm thông tin về nạn nhân. Ông ta là một nhà khảo cổ học, 
            từng tham gia nhiều cuộc khai quật quan trọng. Và điều đáng chú ý là... ba tuần trước, 
            ông ta đã gửi email cho bảo tàng quốc gia về một phát hiện 'có thể thay đổi lịch sử'."
          </p>
          <div class="novel-info-box">
            <p class="novel-info-text">
              Vậy là vụ án không đơn giản như vẻ ngoài. Có một bí mật lớn hơn đang ẩn giấu đằng sau...
            </p>
          </div>
        </div>
      `
    },
    { 
      id: 'p3-3', 
      name: 'Chương 3: Theo dấu vết', 
      pageNumber: 3, 
      type: 'content', 
      content: `
        <div class="novel-chapter">
          <h2 class="novel-chapter-number">Chương 3</h2>
          <h3 class="novel-chapter-title">Theo dấu vết</h3>
          <p class="novel-paragraph">
            Thám tử Minh đến bảo tàng quốc gia vào buổi chiều. Tòa nhà cổ kính với những cột đá trắng 
            cao vút tạo cảm giác trang nghiêm. Trong văn phòng của giám đốc bảo tàng, anh được xem 
            email mà nạn nhân đã gửi.
          </p>
          <p class="novel-paragraph">
            "Tôi đã tìm thấy nó," email viết, "Bản đồ dẫn đến kho báu của triều đại nhà Nguyễn. 
            Nó được giấu trong một ngôi đền cổ ở ngoại ô. Tôi cần sự hỗ trợ từ bảo tàng để tiến hành 
            khai quật một cách chính thống."
          </p>
          <p class="novel-paragraph">
            Giám đốc bảo tàng, ông Tuấn, nhìn thám tử Minh với ánh mắt lo lắng:
          </p>
          <p class="novel-paragraph">
            "Chúng tôi đã lên kế hoạch hỗ trợ ông ấy. Nhưng trước khi cuộc họp diễn ra, ông ấy đã... 
            qua đời. Điều này quá đáng ngờ. Tôi sợ rằng có ai đó không muốn bí mật này được phơi bày."
          </p>
          <p class="novel-paragraph">
            Thám tử Minh gật đầu. Bức tranh đang dần rõ ràng hơn. Nhưng còn nhiều câu hỏi cần được giải đáp. 
            Dãy số 7-14-21-28 liên quan gì đến vụ này? Và quan trọng hơn, kẻ giết người là ai?
          </p>
        </div>
      `
    },
    { 
      id: 'p3-4', 
      name: 'Chương 4: Ngôi đền bí ẩn', 
      pageNumber: 4, 
      type: 'content', 
      content: `
        <div class="novel-chapter alt-bg">
          <h2 class="novel-chapter-number">Chương 4</h2>
          <h3 class="novel-chapter-title">Ngôi đền bí ẩn</h3>
          <p class="novel-paragraph">
            Đêm đó, thám tử Minh quyết định đến ngôi đền mà nạn nhân đã đề cập. Chiếc xe lao vun vút 
            trên con đường ngoại ô vắng vẻ. Trăng sáng chiếu xuống, tạo bóng đen dài trên mặt đất.
          </p>
          <p class="novel-paragraph">
            Ngôi đền cổ nằm sâu trong khu rừng tre. Kiến trúc cổ kính với những viên ngói âm dương 
            phủ đầy rêu phong. Cổng đền khép hờ, như đang mời gọi anh bước vào.
          </p>
          <p class="novel-paragraph">
            Bên trong, ánh đèn pin chiếu lên những bức tường đá cổ. Thám tử Minh bắt đầu tìm kiếm dấu hiệu. 
            Và rồi, anh nhận ra - dãy số 7-14-21-28 chính là vị trí của những viên gạch trên sàn!
          </p>
          <p class="novel-paragraph">
            Khi nhấn vào viên gạch thứ 28, một cánh cửa bí mật mở ra...
          </p>
          <div class="novel-cliffhanger">
            <p class="novel-cliffhanger-text">Tiếp theo sẽ ra sao?</p>
            <p class="novel-cliffhanger-subtitle">Hãy đón đọc chương tiếp theo...</p>
          </div>
        </div>
      `
    }
  ]
};

export const useBookStore = create<BookStore>()((set, get) => ({
  books: MOCK_BOOKS,
  currentBook: null,
  pages: [],
  pagesByBookId: MOCK_PAGES,
  currentPageId: null,
  isLoading: false,
  error: null,

  setReflowSettings: (settings: Partial<ReflowSettings>) => {
    set((state: BookStore) => {
      if (!state.currentBook) return {};
      
      const updatedBook = {
        ...state.currentBook,
        reflowSettings: {
          ...state.currentBook.reflowSettings,
          ...settings
        } as ReflowSettings
      };

      // Update in books array as well
      const updatedBooks = state.books.map(b => 
        b.id === updatedBook.id ? updatedBook : b
      );

      return {
        currentBook: updatedBook,
        books: updatedBooks
      };
    });
  },

  createBook: (bookData: Omit<BookInfo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBook: BookInfo = {
      ...bookData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state: BookStore) => ({
      books: [...state.books, newBook],
      currentBook: newBook,
      pages: [], // New book has no pages initially
      pagesByBookId: { ...state.pagesByBookId, [newBook.id]: [] },
      currentPageId: null
    }));
  },

  updateBook: (id: string, updates: Partial<BookInfo>) => {
    set((state: BookStore) => {
      const updatedBooks = state.books.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
      );
      
      // Also update currentBook if it's the one being updated
      const currentBook = state.currentBook?.id === id
        ? { ...state.currentBook, ...updates, updatedAt: new Date() }
        : state.currentBook;

      return { books: updatedBooks, currentBook };
    });
  },

  deleteBook: (id: string) => {
    set((state: BookStore) => {
      const updatedBooks = state.books.filter((b) => b.id !== id);
      const currentBook = state.currentBook?.id === id ? null : state.currentBook;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: deleted, ...restPages } = state.pagesByBookId;
      return { books: updatedBooks, currentBook, pagesByBookId: restPages };
    });
  },

  setCurrentBook: (id: string) => {
    const book = get().books.find((b) => b.id === id) || null;
    const bookPages = get().pagesByBookId[id] || [];
    set({ currentBook: book, pages: bookPages, currentPageId: bookPages[0]?.id || null });
  },

  addPage: (page: Omit<PageData, 'id'>) => {
    const newPage: PageData = {
      ...page,
      id: crypto.randomUUID(),
    };

    set((state: BookStore) => {
      if (!state.currentBook) return {};
      const updatedPages = [...state.pages, newPage];
      return {
        pages: updatedPages,
        pagesByBookId: {
          ...state.pagesByBookId,
          [state.currentBook!.id]: updatedPages
        }
      };
    });
  },

  updatePage: (id: string, updates: Partial<PageData>) => {
    set((state: BookStore) => {
      if (!state.currentBook) return {};
      const updatedPages = state.pages.map((p) => (p.id === id ? { ...p, ...updates } : p));
      return {
        pages: updatedPages,
        pagesByBookId: {
          ...state.pagesByBookId,
          [state.currentBook!.id]: updatedPages
        }
      };
    });
  },

  deletePage: (id: string) => {
    set((state: BookStore) => {
      if (!state.currentBook) return {};
      const updatedPages = state.pages.filter((p) => p.id !== id);
      return {
        pages: updatedPages,
        pagesByBookId: {
          ...state.pagesByBookId,
          [state.currentBook!.id]: updatedPages
        }
      };
    });
  },

  syncContent: (sourceMode: 'reflow' | 'fixed', targetMode: 'reflow' | 'fixed') => {
    // Placeholder for advanced content synchronization logic
    // For now, since we share the same 'pages' content, this is implicit.
    // Future: Convert absolute positioning to relative for Reflow, etc.
    console.log(`Syncing content from ${sourceMode} to ${targetMode}`);
  },

  importBook: (bookData: {
    title?: string;
    author?: string;
    pages?: Array<{
      name?: string;
      content?: string;
      styles?: Record<string, unknown>;
    }>;
  }) => {
      const newBook: BookInfo = {
          id: 'imported-' + Date.now(),
          title: bookData.title || 'Imported Book',
          author: bookData.author || 'Unknown Author',
          layoutMode: 'reflow', // Default to reflow for imported books usually
          createdAt: new Date(),
          updatedAt: new Date(),
          reflowSettings: {
              fontSize: 16,
              lineHeight: 1.5,
              fontFamily: 'Georgia',
              theme: 'light'
          }
      };

      const newPages: PageData[] = (bookData.pages || []).map((p, i: number) => ({
          id: 'page-' + Date.now() + '-' + i,
          name: p.name || `Page ${i + 1}`,
          content: p.content || '',
          styles: JSON.stringify(p.styles || {}),
          pageNumber: i + 1,
          type: 'content' as const
      }));

      set((state: BookStore) => ({
        books: [...state.books, newBook],
        currentBook: newBook,
        pages: newPages,
        pagesByBookId: { ...state.pagesByBookId, [newBook.id]: newPages },
        currentPageId: newPages[0]?.id || null,
        isLoading: false,
        error: null,
      }));
  },

  setCurrentPageId: (id: string | null) => set({ currentPageId: id }),

  setPages: (pages: PageData[]) => set({ pages }),

  resetStore: () => {
    set({
      books: MOCK_BOOKS,
      currentBook: null,
      pages: [],
      pagesByBookId: MOCK_PAGES,
      currentPageId: null,
      isLoading: false,
      error: null,
    });
  },
}));
