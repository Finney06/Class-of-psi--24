async function submitForm(event) {
  event.preventDefault();
  const fileInput = document.getElementById('picture');
  const file = fileInput.files[0];

  document.getElementById('submit-text').innerText = 'Please wait...';
  document.getElementById('loader').style.display = 'inline-block';

  const formData = {
    Name: document.getElementById('name').value,
    Nickname: document.getElementById('nickname').value,
    "Whatsapp Number": document.getElementById('whatsapp-number').value,
    Email: document.getElementById('email').value,
    "Date of Birth": document.getElementById('dob').value,
    Picture: [{ url: '' }]
  };

  if (!validateForm(formData, file)) {
    document.getElementById('submit-text').innerText = 'Submit';
    document.getElementById('loader').style.display = 'none';
    return;
  }

  try {
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ formData, file })
    });

    if (!response.ok) {
      throw new Error('Error submitting form.');
    }

    showPopup();
    document.getElementById('submit-text').innerText = 'Submit';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('form').reset();
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error submitting form: ' + error.message);
    document.getElementById('submit-text').innerText = 'Submit';
    document.getElementById('loader').style.display = 'none';
  }
}

async function checkUserDataExists(email) {
  try {
    const response = await fetch(`/check-user-data-exists?email=${email}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const loginPopup = document.getElementById('login-popup');
  const continueButton = document.getElementById('continue-button');
  const loginEmailInput = document.getElementById('login-email');

  loginPopup.style.display = 'flex';

  continueButton.addEventListener('click', async function () {
    const email = loginEmailInput.value.trim();

    if (email === '') {
      document.getElementById('continual').innerText = 'Please enter your email!';
      return;
    }

    continueButton.innerHTML = '<div id="loader"></div>';

    const userDataExists = await checkUserDataExists(email);

    if (userDataExists) {
      document.getElementById('giffy').src = 'images/giphy.gif';
      document.getElementById('continual').innerText = 'You have already registered.';
      document.getElementById('login-input').style.display = "none";
      continueButton.innerHTML = 'OK <img class="rocket" src="images/rocket.png" alt="">';
      continueButton.addEventListener('click', function () {
        location.reload();
      });
    } else {
      loginPopup.style.display = 'none';
      const autoFilledEmail = document.getElementById('email');
      autoFilledEmail.value = email;
      autoFilledEmail.disabled = true;
    }
  });
});
