document.addEventListener('DOMContentLoaded', () => {
    // Kütüphaneyi global olarak erişilebilir yap
    const mdParser = window.marked;
    
    // Yükleme fonksiyonu
    async function loadPosts() {
        try {
            // 1. posts.json'ı çek
            const response = await fetch('posts.json');
            const posts = await response.json();

            // 2. Tarihe göre sırala (En yeni en üstte)
            posts.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

            const postListContainer = document.getElementById('post-list-container');
            postListContainer.innerHTML = ''; // Listeyi temizle

            // 3. Sidebar'ı doldur
            posts.forEach(post => {
                const listItem = document.createElement('li');
                listItem.className = 'post-item';
                listItem.textContent = post.baslik;
                
                // Hangi dosyayı çekeceğimizi data attribute ile saklıyoruz
                listItem.dataset.file = post.dosyaAdi; 
                
                // Tıklama olayını bağla
                listItem.addEventListener('click', () => renderPost(post.dosyaAdi, post.baslik, post.yazar, post.tarih));
                
                postListContainer.appendChild(listItem);
            });

            // Opsiyonel: İlk yazıyı otomatik yükle
            if (posts.length > 0) {
                renderPost(posts[0].dosyaAdi, posts[0].baslik, posts[0].yazar, posts[0].tarih);
            }

        } catch (error) {
            console.error('Yazılar yüklenirken bir hata oluştu:', error);
            document.getElementById('content').innerHTML = '<h2>Hata</h2><p>Yazı listesi yüklenemedi. posts.json dosyasını kontrol edin.</p>';
        }
    }

    // Seçilen Markdown dosyasını render etme fonksiyonu
    async function renderPost(fileName, baslik, yazar, tarih) {
        const contentArea = document.getElementById('content');
        
        try {
            // 1. Markdown dosyasını çek
            const response = await fetch(`posts/${fileName}`);
            const markdownText = await response.text();

            // 2. Markdown'ı HTML'e çevir
            const htmlContent = mdParser.parse(markdownText);
            
            // 3. İçerik alanını yeni HTML ile doldur
            contentArea.innerHTML = `
                <h2 class="post-title">${baslik}</h2>
                <div class="post-meta">
                    <span class="post-author">Yazar: ${yazar}</span> | 
                    <span class="post-date">${tarih}</span>
                </div>
                <hr style="border-color: #eee;">
                <div class="post-body">${htmlContent}</div>
            `;
            
            // Okuyucuyu sayfanın başına kaydır
            contentArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(`"${fileName}" yüklenirken hata oluştu:`, error);
            contentArea.innerHTML = `<h2>Hata</h2><p>"${baslik}" başlıklı yazıya ulaşılamadı. Dosya adını kontrol edin: <code>posts/${fileName}</code></p>`;
        }
    }

    loadPosts();
});
