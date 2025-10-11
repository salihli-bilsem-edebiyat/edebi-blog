document.addEventListener("DOMContentLoaded", () => {
    const blogLinksContainer = document.getElementById("blog-links");
    const contentContainer = document.getElementById("content");

    // Blogları yükle
    fetch("post/posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Yazılar yüklenemedi.");
            }
            return response.json();
        })
        .then(posts => {
            // Tarihe göre sıralama (en son eklenen en üstte)
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Blog bağlantılarını oluştur
            posts.forEach((post, index) => {
                const listItem = document.createElement("li");
                const link = document.createElement("a");
                link.href = "#";
                link.textContent = `${post.title} (${post.date})`;
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    loadMarkdown(post.slug); // Seçilen yazıyı yükle
                });
                listItem.appendChild(link);
                blogLinksContainer.appendChild(listItem);

                // Varsayılan olarak en son eklenen yazıyı yükle
                if (index === 0) {
                    loadMarkdown(post.slug);
                }
            });
        })
        .catch(error => {
            console.error("Yazılar yüklenirken hata oluştu:", error);
            blogLinksContainer.innerHTML = "<p>Yazılar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
});

// Markdown dosyasını yükle ve soldaki büyük alanda göster
function loadMarkdown(slug) {
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = "<p>Yükleniyor...</p>"; // Yüklenme mesajı

    fetch(`post/${slug}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Markdown dosyası yüklenemedi.");
            }
            return response.text();
        })
        .then(markdown => {
            contentContainer.innerHTML = marked(markdown); // Markdown içeriğini işlemek için marked.js kullanılıyor
        })
        .catch(error => {
            console.error("Markdown dosyası yüklenirken hata oluştu:", error);
            contentContainer.innerHTML = "<p>Markdown dosyası yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
}
