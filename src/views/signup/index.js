// Inicializar EmailJS con tu Public Key
emailjs.init("TU_PUBLIC_KEY_AQUI");

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
e.preventDefault();

  // capturar valores de los inputs
const inputs = form.querySelectorAll('input');
const username = inputs[0].value;
const email = inputs[1].value;
const password = inputs[2].value;
const confirmPassword = inputs[3].value;

if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
}

try {
    // enviar datos al backend
    const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
    alert(data.error || 'Error al registrar el usuario');
    return;
    }

    // si el usuario se guardó en la BD, enviamos el correo mediante EmailJS
    const templateParams = {
    to_name: data.user.username,
    to_email: data.user.email,
    verification_link: `${window.location.origin}/api/users/${data.user.id}/${data.token}`
    };

    await emailjs.send('EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', templateParams);

    alert('¡Cuenta registrada! Te hemos enviado un correo de verificación.');
    window.location.href = '/login';

} catch (error) {
    console.error('Error:', error);
    alert('Ocurrió un error al procesar la solicitud');
}
});