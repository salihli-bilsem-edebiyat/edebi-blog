document.addEventListener('DOMContentLoaded', () => {
    // Marked.js kütüphanesini kullanıyoruz
    const mdParser = window.marked;
    const contentArea = document.getElementById('content');
    const postListContainer = document.getElementById('post-list-container');
    const searchInput = document.querySelector('.arama-input');

    let allPosts = []; // Tüm yazıları burada tutacağız (Arama için gerekli)

    // posts.json'ı yükleyen ve sidebar'ı oluşturan ana fonksiyon
    async function loadPosts() {
        try {
            // Düzeltilmiş doğru dosya yolu: 'post/posts.json'
            const response = await fetch('post/posts.json');
            
            if (!response.ok) {
                throw new Error(`HTTP Hata kodu: ${response.status}`);
            }

            allPosts = await response.json(); // Tüm yazıları global değişkene ata

            // 1. Yazıları tarihe göre sırala (En yeni en üstte)
            allPosts.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

            // Sidebar'ı oluştur
            renderPostList(allPosts);

            // 3. Opsiyonel: Site açıldığında en yeni yazıyı otomatik yükle
            if (allPosts.length > 0) {
                const firstPost = allPosts[0];
                renderPost(firstPost.dosyaAdi, firstPost.baslik, firstPost.yazar, firstPost.tarih);
                // İlk listeye aktif sınıfı ekle
                postListContainer.querySelector('.post-item').classList.add('active');
            }

            // 4. Arama Çubuğunu Aktif Et
            setupSearch();

        } catch (error) {
            console.error('Yazılar yüklenirken bir hata oluştu:', error);
            contentArea.innerHTML = `<h2>Hata</h2><p>Yazı listesi yüklenemedi. Sunucu veya JSON formatı hatası: ${error.message}</p>`;
        }
    }
    
    // Sidebar'a yazı listesini render eden yardımcı fonksiyon
    function renderPostList(postsToRender) {
        postListContainer.innerHTML = ''; // Listeyi temizle
        
        postsToRender.forEach(post => {
            const listItem = document.createElement('li');
            listItem.className = 'post-item';
            listItem.textContent = post.baslik;
            
            listItem.addEventListener('click', (e) => {
                // Tıklanan yazıyı yükle
                renderPost(post.dosyaAdi, post.baslik, post.yazar, post.tarih);
                
                // Aktif olan öğeyi görsel olarak vurgula
                document.querySelectorAll('.post-item').forEach(item => item.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
            
            postListContainer.appendChild(listItem);
        });
    }

    // Arama Çubuğu Fonksiyonu
    function setupSearch() {
        searchInput.addEventListener('input', (e) => {
            const aramaTerimi = e.target.value.toLowerCase().trim();

            const filtrelenmisYazilar = allPosts.filter(post => 
                // Başlık veya yazar adında arama yap
                post.baslik.toLowerCase().includes(aramaTerimi) ||
                post.yazar.toLowerCase().includes(aramaTerimi) 
            );

            // Filtrelenmiş yazıları render et
            renderPostList(filtrelenmisYazilar);
        });
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
            
            // Sayfanın başına kaydır
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(`"${fileName}" yüklenirken hata oluştu:`, error);
            contentArea.innerHTML = `<h2>Hata</h2><p>"${baslik}" başlıklı yazıya ulaşılamadı. Dosya adını kontrol edin: <code>post/${fileName}</code></p>`;
        }
    }

    loadPosts();
});
