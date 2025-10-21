document.addEventListener('DOMContentLoaded', () => {
    const mdParser = window.marked;
    const contentArea = document.getElementById('content');
    const postListContainer = document.getElementById('post-list-container');
    const yazarFiltreSelect = document.getElementById('yazar-filtre');
    const siralaSelect = document.getElementById('sirala-secim');
    const filtreButton = document.getElementById('filtre-button');

    let allPosts = []; // Tüm yazıları burada tutacağız

    // posts.json'ı yükleyen ana fonksiyon
    async function loadPosts() {
        try {
            const response = await fetch('post/posts.json');
            
            if (!response.ok) {
                throw new Error(`HTTP Hata kodu: ${response.status}`);
            }

            allPosts = await response.json(); 

            // Benzersiz Yazarları topla ve drop-down menüye ekle
            populateAuthorFilter(allPosts);
            
            // İlk yüklemede varsayılan sıralama ile listeyi göster
            const sortedPosts = sortPosts(allPosts, 'tarih_yeni');
            renderPostList(sortedPosts);

            // Site açıldığında en yeni yazıyı otomatik yükle
            if (sortedPosts.length > 0) {
                const firstPost = sortedPosts[0];
                renderPost(firstPost.dosyaAdi, firstPost.baslik, firstPost.yazar, firstPost.tarih);
                if (postListContainer.querySelector('.post-item')) {
                     postListContainer.querySelector('.post-item').classList.add('active');
                }
            }
            
            // Filtreleme butonuna tıklama olayını bağla
            filtreButton.addEventListener('click', applyFiltersAndSorting);

        } catch (error) {
            console.error('Yazılar yüklenirken bir hata oluştu:', error);
            contentArea.innerHTML = `<h2>Hata</h2><p>Yazı listesi yüklenemedi. Sunucu veya JSON formatı hatası: ${error.message}</p>`;
        }
    }
    
    // Benzersiz Yazarları select menüye ekler
    function populateAuthorFilter(posts) {
        const yazarlar = new Set();
        posts.forEach(post => yazarlar.add(post.yazar));
        
        yazarlar.forEach(yazar => {
            const option = document.createElement('option');
            option.value = yazar;
            option.textContent = yazar;
            yazarFiltreSelect.appendChild(option);
        });
    }

    // Filtreleri uygulayıp sıralamayı yapan ana fonksiyon
    function applyFiltersAndSorting() {
        const secilenYazar = yazarFiltreSelect.value;
        const siralaTuru = siralaSelect.value;
        
        let filtrelenmisYazilar = allPosts;
        
        // 1. Yazara Göre Filtrele
        if (secilenYazar !== 'Tümü') {
            filtrelenmisYazilar = allPosts.filter(post => post.yazar === secilenYazar);
        }
        
        // 2. Sıralamayı Uygula
        const finalPosts = sortPosts(filtrelenmisYazilar, siralaTuru);
        
        // 3. Listeyi Güncelle
        renderPostList(finalPosts);
    }
    
    // Sıralama mantığını içeren fonksiyon
    function sortPosts(posts, type) {
        // Kopyayı sırala ki orijinal liste bozulmasın
        const sorted = [...posts]; 

        switch (type) {
            case 'tarih_yeni':
                return sorted.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
            case 'tarih_eski':
                return sorted.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
            case 'alfabetik_az':
                return sorted.sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr', { sensitivity: 'base' }));
            case 'alfabetik_za':
                return sorted.sort((a, b) => b.baslik.localeCompare(a.baslik, 'tr', { sensitivity: 'base' }));
            default:
                return sorted; // Varsayılan
        }
    }

    // Sidebar'a yazı listesini render eden yardımcı fonksiyon
    function renderPostList(postsToRender) {
        postListContainer.innerHTML = ''; 
        
        postsToRender.forEach(post => {
            const listItem = document.createElement('li');
            listItem.className = 'post-item';
            listItem.textContent = post.baslik;
            
            listItem.addEventListener('click', (e) => {
                renderPost(post.dosyaAdi, post.baslik, post.yazar, post.tarih);
                document.querySelectorAll('.post-item').forEach(item => item.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
            
            postListContainer.appendChild(listItem);
        });
        
        // Filtreleme sonrası listedeki ilk öğeyi aktif yap (görsel tutarlılık için)
        if (postListContainer.firstChild) {
            postListContainer.firstChild.classList.add('active');
        }
    }


    // Seçilen Markdown dosyasını çekip render eden fonksiyon (Önceki kodla aynı)
    async function renderPost(fileName, baslik, yazar, tarih) {
        
        try {
            const response = await fetch(`post/${fileName}`);
            
            if (!response.ok) {
                throw new Error(`Markdown dosyası bulunamadı: ${response.status}`);
            }

            const markdownText = await response.text();
            const htmlContent = mdParser.parse(markdownText);
            
            contentArea.innerHTML = `
                <h2 class="post-title">${baslik}</h2>
                <div class="post-meta">
                    <span class="post-author">Yazar: ${yazar}</span> | 
                    <span class="post-date">${tarih}</span>
                </div>
                <hr style="border-color: #eee;">
                <div class="post-body">${htmlContent}</div>
            `;
            
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(`"${fileName}" yüklenirken hata oluştu:`, error);
            contentArea.innerHTML = `<h2>Hata</h2><p>"${baslik}" başlıklı yazıya ulaşılamadı. Dosya adını kontrol edin: <code>post/${fileName}</code></p>`;
        }
    }

    loadPosts();
});
