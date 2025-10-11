document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("blog-posts");

    // postsContainer'ın varlığını kontrol et
    if (!postsContainer) {
        console.error("postsContainer öğesi bulunamadı. HTML'de id='blog-posts' öğesini kontrol edin.");
        return;
    }

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
                    <p>${post.content}</p>
                `;
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error("Yazılar yüklenirken hata oluştu:", error);
            postsContainer.innerHTML = "<p>Yazılar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>";
        });
});
