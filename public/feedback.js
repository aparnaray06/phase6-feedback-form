
async function getFeedback() {
    const feedbackList = document.getElementById("feedback-list");

    if (!feedbackList) {
        return;
    }

    try {
        const response = await fetch("/feedback");

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Could not load feedback.");
        }

        const feedback = await response.json();

        if (!Array.isArray(feedback) || feedback.length === 0) {
            feedbackList.innerHTML = `
                <div class="empty">
                    <h2>No Feedback Yet</h2>
                    <p>Be the first student to share your feedback!</p>
                    <a class="button-link" href="index.html">
                        Give Feedback
                    </a>
                </div>
            `;
            return;
        }

        feedbackList.innerHTML = "";

        feedback.forEach((item) => {
            const card = document.createElement("div");
            card.className = "feedback-card";

            const name = document.createElement("h2");
            name.textContent = item.name;

            const rating = document.createElement("div");
            rating.className = "rating";
            rating.textContent = "⭐".repeat(Number(item.rating) || 0);

            const comment = document.createElement("p");
            comment.textContent = item.comment;

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                editFeedback(item._id, item.name, item.rating, item.comment);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteFeedback(item._id);
            });

            card.append(name, rating, comment, editButton, deleteButton);
            feedbackList.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        feedbackList.innerHTML = `
            <div class="empty">
                <h2>Could not load feedback</h2>
                <button onclick="window.location.href='index.html'">Give Feedback</button>
            </div>
        `;
    }
}

async function deleteFeedback(id) {
    if (!id) {
        return;
    }

    try {
        const response = await fetch(`/feedback/${id}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Could not delete feedback.");
            return;
        }

        alert(data.message);
        getFeedback();
    } catch (error) {
        console.error(error);
    }
}

async function editFeedback(id, oldName, oldRating, oldComment) {
    const name = window.prompt("Enter your name", oldName || "");
    const ratingInput = window.prompt("Enter rating (1-5)", String(oldRating || ""));
    const comment = window.prompt("Enter comment", oldComment || "");

    if (name === null || ratingInput === null || comment === null) {
        return;
    }

    const trimmedName = name.trim();
    const rating = Number(ratingInput);
    const trimmedComment = comment.trim();

    if (!trimmedName || Number.isNaN(rating) || rating < 1 || rating > 5 || !trimmedComment) {
        alert("Please enter a valid name, rating from 1 to 5, and comment.");
        return;
    }

    try {
        const response = await fetch(`/feedback/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: trimmedName,
                rating,
                comment: trimmedComment,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Could not update feedback.");
            return;
        }

        alert(data.message);
        getFeedback();
    } catch (error) {
        console.error(error);
    }
}

getFeedback();