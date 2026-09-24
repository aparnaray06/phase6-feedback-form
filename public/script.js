const feedbackForm = document.getElementById("feedbackForm");
const message = document.getElementById("message");

if (feedbackForm && message) {
    feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitButton = feedbackForm.querySelector("button[type=submit]");
        const nameInput = document.getElementById("name");
        const ratingInput = document.getElementById("rating");
        const commentInput = document.getElementById("comment");

        const name = nameInput.value.trim();
        const rating = Number(ratingInput.value);
        const comment = commentInput.value.trim();

        if (!name || Number.isNaN(rating) || rating < 1 || rating > 5 || !comment) {
            message.textContent = "Please enter a valid name, rating from 1 to 5, and comment.";
            message.style.color = "#b91c1c";
            return;
        }

        message.textContent = "Submitting...";
        message.style.color = "#555";
        submitButton.disabled = true;

        try {
            const response = await fetch("/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    rating,
                    comment,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = "Feedback submitted successfully!";
                message.style.color = "green";
                feedbackForm.reset();
            } else {
                message.textContent = data.error || "Could not submit feedback.";
                message.style.color = "#b91c1c";
            }
        } catch (error) {
            message.textContent = "Could not connect to the server. Please try again.";
            message.style.color = "#b91c1c";
        } finally {
            submitButton.disabled = false;
        }
    });
}