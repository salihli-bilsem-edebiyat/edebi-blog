document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("blog-posts");

    // Ana sayfa için yazıları yükle
    fetch("post/posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Yazılar yüklenemedi.");
            }
            return response.json();
        })
        .then(posts => {
            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("blog-post");
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p class="meta"><strong>Tarih:</strong> ${post.date} | <strong>Yazar:</strong> ${post.author}</p>
                    <p>${post.content.substring(0, 100)}...</p>
                `;

                // "Devamını Oku" bağlantısı ekle
                const link = document.createElement("a");
                link.href = `post/${post.slug}.md`; // Markdown dosyasına bağlantı
                link.textContent = "Devamını Oku";
                link.classList.add("read-more");
                link.addEventListener("click", (e) => {
                    e.preventDefault(); // Sayfa yönlendirmesini engelle
                    loadMarkdown(post.slug); // Markdown dosyasını yükle
                });

                postElement.appendChild(link);
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error("Yazılar yüklenirken hata oluştu:", error);
            postsContainer.innerHTML = "<p>Yazılar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
});

// Markdown dosyasını yükle ve detay sayfasında göster
function loadMarkdown(slug) {
    const postsContainer = document.getElementById("blog-posts");
    postsContainer.innerHTML = "<p>Yükleniyor...</p>"; // Yüklenme mesajı

    fetch(`post/${slug}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Markdown dosyası yüklenemedi.");
            }
            return response.text();
        })
        .then(markdown => {
            // Markdown içeriğini göster
            postsContainer.innerHTML = `
                <article class="markdown-content">
                    ${marked(markdown)} <!-- Markdown içeriğini işlemek için marked.js kullanılıyor -->
                </article>
                <button id="back-button">Geri Dön</button>
            `;

            // "Geri Dön" butonu ekle
            const backButton = document.getElementById("back-button");
            backButton.addEventListener("click", () => {
                location.reload(); // Sayfayı yeniden yükle
            });
        })
        .catch(error => {
            console.error("Markdown dosyası yüklenirken hata oluştu:", error);
            postsContainer.innerHTML = "<p>Markdown dosyası yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
}
