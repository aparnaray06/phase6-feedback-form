

async function getFeedback() {
    try {
        const response = await fetch("/feedback");
        const feedback = await response.json();

        const feedbackList = document.getElementById("feedback-list");

        if (feedback.length === 0) {
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

            card.innerHTML = `
                <h2>${item.name}</h2>

                <div class="rating">
                    ${"⭐".repeat(item.rating)}
                </div>
                <p>${item.comment}</p>

     <button onclick="editFeedback('${item._id}', '${item.name}', ${item.rating}, '${item.comment}')">
        Edit
    </button>

    <button onclick="deleteFeedback  ('${item._id}')">
        Delete
    </button>
    `;

            feedbackList.appendChild(card);
        });

    } catch (error) {
        console.log(error);
    }
}

async function deleteFeedback(id) {
    try {
        const response = await fetch(`/feedback/${id}`, {
            method: "DELETE",
        })
        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }
        alert(data.message);
        getFeedback();
    } catch (error) {
        console.log(error);

    }

}


async function editFeedback(id, oldName, oldRating, oldComment) {
    const name = prompt("Enter your mane", oldName);

    const rating = prompt("Enter rating (1-5", oldRating);

    const comment = prompt("Enter comment", oldComment);

    if (!name || !rating || !comment) {
        return;
    }
    try {
        const response = await fetch(`/feedback/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                rating,
                comment,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error)
            return;
        }
        alert(data.message);
        getFeedback();
    } catch (error) {
        console.log(error);

    }

}


getFeedback();