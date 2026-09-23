const feedbackForm =
    document.getElementById("feedbackForm");
const message = document.getElementById("message");

feedbackForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitButton = feedbackForm.querySelector("button[type=submit]");

    const name =
        document.getElementById("name").value.trim();

    const rating =
        document.getElementById("rating").value;

    const comment =
        document.getElementById("comment").value.trim();

    message.textContent = "Submitting...";
    message.style.color = "#555";
    submitButton.disabled = true;

    try {

        const response = await fetch("/feedback", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                rating,
                comment
            })

        });

        const data = await response.json();

        if (response.ok) {

            message.textContent =
                "Feedback submitted successfully!";
            message.style.color = "green";

            feedbackForm.reset();

        } else {

            message.textContent =
                data.error || "Could not submit feedback.";
            message.style.color = "#b91c1c";

        }

    } catch (error) {

        message.textContent =
            "Could not connect to the server. Please try again.";
        message.style.color = "#b91c1c";
    } finally {
        submitButton.disabled = false;

    }

});