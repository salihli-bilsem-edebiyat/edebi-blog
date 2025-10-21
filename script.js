document.addEventListener('DOMContentLoaded', () => {
    // Marked.js kütüphanesini kullanıyoruz (index.html'e eklenmişti)
    const mdParser = window.marked;
    const contentArea = document.getElementById('content');

    // posts.json'ı yükleyen ve sidebar'ı oluşturan ana fonksiyon
    async function loadPosts() {
        try {
            // Düzeltilmiş doğru dosya yolu: 'post/posts.json'
            const response = await fetch('post/posts.json');
            
            // Eğer 404 gibi bir HTTP hatası varsa kontrol et
            if (!response.ok) {
                throw new Error(`HTTP Hata kodu: ${response.status}`);
            }

            const posts = await response.json();

            // 1. Yazıları tarihe göre sırala (En yeni en üstte)
            // Tarihleri Date objesine çevirerek karşılaştırma en güvenilir yoldur.
            posts.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

            const postListContainer = document.getElementById('post-list-container');
            postListContainer.innerHTML = ''; // Önceki listeyi temizle

            // 2. Sidebar'ı (Eser Listesini) doldur
            posts.forEach(post => {
                const listItem = document.createElement('li');
                listItem.className = 'post-item';
                listItem.textContent = post.baslik;
                
                // Tıklama olayını bağla ve yazı bilgilerini fonksiyona geçir
                listItem.addEventListener('click', () => {
                    // Tıklanan yazıyı yükle
                    renderPost(post.dosyaAdi, post.baslik, post.yazar, post.tarih);
                    
                    // Aktif olan öğeyi görsel olarak vurgula
                    document.querySelectorAll('.post-item').forEach(item => item.classList.remove('active'));
                    listItem.classList.add('active');
                });
                
                postListContainer.appendChild(listItem);
            });

            // 3. Opsiyonel: Site açıldığında en yeni yazıyı otomatik yükle
            if (posts.length > 0) {
                renderPost(posts[0].dosyaAdi, posts[0].baslik, posts[0].yazar, posts[0].tarih);
                // İlk listeye aktif sınıfı ekle
                postListContainer.querySelector('.post-item').classList.add('active');
            }

        } catch (error) {
            console.error('Yazılar yüklenirken bir hata oluştu:', error);
            contentArea.innerHTML = `<h2>Hata</h2><p>Yazı listesi yüklenemedi. Sunucu veya JSON formatı hatası: ${error.message}</p>`;
        }
    }

    // Seçilen Markdown dosyasını çekip render eden fonksiyon
    async function renderPost(fileName, baslik, yazar, tarih) {
        
        try {
            // Markdown dosyaları da 'post/' klasöründe olmalı
            const response = await fetch(`post/${fileName}`);
            
            if (!response.ok) {
                throw new Error(`Markdown dosyası bulunamadı: ${response.status}`);
            }

            const markdownText = await response.text();

            // Markdown'ı HTML'e çevir
            const htmlContent = mdParser.parse(markdownText);
            
            // İçerik alanını yeni HTML ile doldur
            contentArea.innerHTML = `
                <h2 class="post-title">${baslik}</h2>
                <div class="post-meta">
                    <span class="post-author">Yazar: ${yazar}</span> | 
                    <span class="post-date">${tarih}</span>
                </div>
                <hr style="border-color: #eee;">
                <div class="post-body">${htmlContent}</div>
            `;
            
            // Okuyucuyu sayfanın başına kaydır (CSS'te smooth scroll varsa daha iyi görünür)
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(`"${fileName}" yüklenirken hata oluştu:`, error);
            contentArea.innerHTML = `<h2>Hata</h2><p>"${baslik}" başlıklı yazıya ulaşılamadı. Dosya adını kontrol edin: <code>post/${fileName}</code></p>`;
        }
    }

    loadPosts();
});
