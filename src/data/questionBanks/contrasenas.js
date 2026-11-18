export const contrasenasQuestions = [
  {
    text: '¿Qué utiliza la autenticación multifactor (MFA)?',
    options: [
      'Una sola contraseña muy larga',
      'Dos o más factores diferentes para verificar la identidad',
      'Un antivirus actualizado',
      'Una copia de seguridad',
    ],
    correctIndex: 1,
    explanation:
      'MFA combina factores de distinto tipo, como algo que sabes, algo que tienes o algo que eres, para reducir el riesgo de acceder solo con una contraseña.',
  },
  {
    text: '¿Qué ataque reutiliza contraseñas filtradas de un servicio para intentar acceder a otras cuentas?',
    options: ['Fuerza bruta', 'Ataque de diccionario', 'Relleno de credenciales', 'Phishing'],
    correctIndex: 2,
    explanation:
      'El relleno de credenciales prueba credenciales filtradas en otros servicios. Por eso cada cuenta debe tener una contraseña única.',
  },
  {
    text: '¿Cuál es una recomendación de seguridad para las contraseñas?',
    options: [
      'Usar la misma clave en todos los servicios',
      'Compartirla solo con personas de confianza',
      'Utilizar contraseñas largas y únicas para cada cuenta',
      'Usar fechas de nacimiento',
    ],
    correctIndex: 2,
    explanation:
      'Las contraseñas largas y únicas reducen el riesgo de fuerza bruta y de reutilización. Conviene complementarlas con autenticación multifactor.',
  },
  {
    text: '¿Qué es la autenticación?',
    options: [
      'El proceso de comprobar que una persona es quien dice ser',
      'El proceso de cifrar archivos',
      'La instalación de un antivirus',
      'La creación de una copia de seguridad',
    ],
    correctIndex: 0,
    explanation:
      'Autenticar significa verificar la identidad antes de permitir el acceso a un sistema, una cuenta o un servicio.',
  },
  {
    text: '¿Qué añade la verificación en dos pasos (2FA) al inicio de sesión?',
    options: [
      'Una segunda comprobación además de la contraseña',
      'Un segundo antivirus',
      'Una segunda copia de seguridad',
      'Un segundo usuario administrador',
    ],
    correctIndex: 0,
    explanation:
      '2FA añade una comprobación adicional, como un código o una llave de seguridad, después de introducir la contraseña.',
  },
  {
    text: '¿Para qué sirve un gestor de contraseñas?',
    options: [
      'Para almacenar y administrar credenciales de forma protegida',
      'Para compartir contraseñas con desconocidos',
      'Para desactivar la autenticación',
      'Para sustituir las copias de seguridad',
    ],
    correctIndex: 0,
    explanation:
      'Un gestor permite guardar claves únicas y largas sin memorizarlas todas, protegiéndolas con una clave maestra.',
  },
  {
    text: '¿Qué es un ataque de fuerza bruta?',
    options: [
      'Probar muchas combinaciones hasta acertar la contraseña',
      'Robar el teclado del equipo',
      'Cifrar los archivos del usuario',
      'Enviar correos publicitarios',
    ],
    correctIndex: 0,
    explanation:
      'La fuerza bruta automatiza intentos con múltiples combinaciones. Las claves largas y la limitación de intentos lo dificultan.',
  },
  {
    text: '¿Qué caracteriza a un ataque de diccionario?',
    options: [
      'Probar contraseñas frecuentes y palabras incluidas en listas',
      'Alterar el hardware del equipo',
      'Suplantar una página web',
      'Bloquear la red',
    ],
    correctIndex: 0,
    explanation:
      'Los ataques de diccionario usan listas de palabras y claves comunes. Evita palabras predecibles y usa frases largas.',
  },
  {
    text: '¿Por qué es peligroso reutilizar la misma contraseña en varios servicios?',
    options: [
      'Porque una filtración puede comprometer todas las cuentas',
      'Porque el equipo se queda sin batería',
      'Porque el antivirus deja de funcionar',
      'Porque la red se vuelve más lenta',
    ],
    correctIndex: 0,
    explanation:
      'Si una cuenta se filtra, el atacante puede probar esa clave en otros servicios. La reutilización amplía el daño.',
  },
  {
    text: '¿Cuál es una característica de una contraseña segura?',
    options: [
      'Ser larga, difícil de adivinar y única para cada servicio',
      'Ser corta y fácil de recordar',
      'Incluir tu nombre y fecha de nacimiento',
      'Usarse en todas las cuentas',
    ],
    correctIndex: 0,
    explanation:
      'La longitud, la imprevisibilidad y la unicidad son claves. Los datos personales evidentes facilitan los ataques.',
  },
  {
    text: '¿Qué debes hacer si sospechas que tus credenciales fueron comprometidas?',
    options: [
      'Cambiar la contraseña desde un dispositivo confiable y activar MFA',
      'Seguir usando la misma clave',
      'Compartirla para comprobar si funciona',
      'Esperar sin hacer nada',
    ],
    correctIndex: 0,
    explanation:
      'Cambiar la clave y activar un segundo factor limita el acceso. También conviene revisar la cuenta y avisar a la entidad.',
  },
  {
    text: '¿Se deben compartir los códigos de verificación?',
    options: [
      'No, nunca con terceros',
      'Sí, si la persona dice ser del banco',
      'Sí, por mensaje de texto',
      'Sí, si es un compañero de trabajo',
    ],
    correctIndex: 0,
    explanation:
      'Los códigos son un factor de autenticación. Compartirlos permite que un atacante complete el acceso.',
  },
  {
    text: '¿Cuál es un ejemplo de factor "algo que tienes" en MFA?',
    options: [
      'Un teléfono o una llave de seguridad',
      'Una contraseña que recuerdas',
      'Tu huella digital',
      'Tu nombre de usuario',
    ],
    correctIndex: 0,
    explanation:
      'Algo que tienes es un dispositivo o token físico. Algo que sabes es una contraseña y algo que eres es una característica biométrica.',
  },
  {
    text: '¿Qué es una frase de contraseña (passphrase)?',
    options: [
      'Una secuencia larga de palabras fácil de recordar y difícil de adivinar',
      'Una contraseña de dos caracteres',
      'El nombre de tu mascota',
      'Un código público',
    ],
    correctIndex: 0,
    explanation:
      'Una passphrase combina varias palabras para ganar longitud. Debe ser única y no basarse en datos públicos.',
  },
  {
    text: '¿Qué datos conviene evitar en una contraseña?',
    options: [
      'Fechas de nacimiento, nombres y datos personales evidentes',
      'Una combinación aleatoria de palabras',
      'Una frase larga y única',
      'Un gestor de contraseñas',
    ],
    correctIndex: 0,
    explanation:
      'Los datos personales son fáciles de obtener o adivinar. Mejor usa una frase larga y aleatoria.',
  },
  {
    text: '¿Qué debe hacerse con las contraseñas predeterminadas de un dispositivo?',
    options: [
      'Cambiarlas antes de usarlo',
      'Mantenerlas porque son más seguras',
      'Publicarlas en internet',
      'Compartirlas con todos los usuarios',
    ],
    correctIndex: 0,
    explanation:
      'Las credenciales por defecto son conocidas. Cambiarlas evita accesos no autorizados.',
  },
  {
    text: '¿Qué es el robo de credenciales?',
    options: [
      'Obtener datos de acceso mediante engaños o páginas falsas',
      'Cambiar la contraseña por iniciativa propia',
      'Actualizar el sistema operativo',
      'Crear una copia de seguridad',
    ],
    correctIndex: 0,
    explanation:
      'El robo de credenciales busca usuario y contraseña mediante engaños, páginas falsas u otras técnicas.',
  },
  {
    text: 'Si un servicio ofrece autenticación multifactor, ¿qué conviene hacer?',
    options: [
      'Activarla siempre que sea posible',
      'Desactivarla para entrar más rápido',
      'Compartir el código con conocidos',
      'Usar solo la misma contraseña',
    ],
    correctIndex: 0,
    explanation:
      'Activar MFA añade una barrera adicional. Aunque la contraseña se filtre, el atacante necesita otro factor.',
  },
  {
    text: 'Antes de introducir tu contraseña en una web, ¿qué conviene comprobar?',
    options: [
      'Que el dominio sea oficial y hayas accedido por un canal confiable',
      'Que la página tenga muchos colores',
      'Que el enlace venga en un mensaje urgente',
      'Que el formulario pida más datos personales',
    ],
    correctIndex: 0,
    explanation:
      'Verificar el dominio y acceder desde canales oficiales evita entregar credenciales a páginas falsas.',
  },
  {
    text: '¿Qué combinación es más segura?',
    options: [
      'Contraseña larga y única más MFA',
      'Contraseña corta repetida',
      'Nombre de usuario como contraseña',
      'Una sola palabra común',
    ],
    correctIndex: 0,
    explanation:
      'Una clave robusta y un segundo factor reducen el riesgo. La longitud y la unicidad son esenciales.',
  },
];
