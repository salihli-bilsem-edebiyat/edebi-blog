document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("blog-posts");

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
                    <p>${post.content}</p>
                `;
                postsContainer.appendChild(postElement);

                // Örnek: Slug ile detay sayfasına bağlantı ekleme
                const link = document.createElement("a");
                link.href = `post/${post.slug}.html`;
                link.textContent = "Devamını Oku";
                postElement.appendChild(link);
            });
        })
        .catch(error => {
            console.error("Yazılar yüklenirken hata oluştu:", error);
            postsContainer.innerHTML = "<p>Yazılar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
});
