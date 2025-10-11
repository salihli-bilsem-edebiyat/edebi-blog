// Blog yazılarını yüklemek için script
document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("blog-posts");

    // post.json dosyasından yazıları yükle
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
                    <button class="read-more" data-slug="${post.slug}">Devamını Oku</button>
                `;
                postsContainer.appendChild(postElement);
            });

            // "Devamını Oku" butonlarına tıklama olayını dinle
            const readMoreButtons = document.querySelectorAll(".read-more");
            readMoreButtons.forEach(button => {
                button.addEventListener("click", (e) => {
                    const slug = e.target.getAttribute("data-slug");
                    loadMarkdown(slug); // Seçilen yazıyı yükle
                });
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
                throw new Error(`Markdown dosyası yüklenemedi: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(markdown => {
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
            postsContainer.innerHTML = `<p>${error.message}</p>`;
        });
}
