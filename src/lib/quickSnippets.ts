export interface QuickSnippet {
  shortcut: string;
  title: string;
  text: string;
  category: 'VENTAS' | 'LOGÍSTICA' | 'SOPORTE';
}

export const DEFAULT_SNIPPETS: QuickSnippet[] = [
  {
    shortcut: '/talla',
    title: 'Guía de Tallas y Ajuste Gratuito',
    text: 'Hola! 💍 Si tienes dudas con la talla para tu sortija o alianza, no te preocupes: te podemos enviar un anillero físico sin coste a tu domicilio o realizar el primer ajuste de medida totalmente gratuito en nuestro Atelier de El Encinar.',
    category: 'VENTAS'
  },
  {
    shortcut: '/cita',
    title: 'Cita Privada en L\'Atelier El Encinar',
    text: 'Será un placer recibirte en nuestro Atelier (C.C. El Encinar, La Moraleja). ¿Qué día y franja horaria te vendría mejor para reservarte una cita privada y mostrarte la pieza en persona? ✨',
    category: 'VENTAS'
  },
  {
    shortcut: '/certificado',
    title: 'Calidad Oro 18k y Certificado Gemológico',
    text: 'Todas nuestras piezas están elaboradas artesanalmente en España en Oro de 18 quilates con gemas naturales seleccionadas y se entregan con su certificado oficial de autenticidad y garantía gemológica. 💎',
    category: 'SOPORTE'
  },
  {
    shortcut: '/envio',
    title: 'Envío Blindado Asegurado 100%',
    text: 'El envío se realiza mediante mensajería urgente de alta seguridad con seguro a todo riesgo incluido en el valor total de la joya y entrega en mano asegurada en 24-48 horas. 📦🔒',
    category: 'LOGÍSTICA'
  },
  {
    shortcut: '/transformar',
    title: 'Transformación y Joyería a Medida',
    text: 'Además de nuestra colección, en By Elena Carrera contamos con taller propio para transformar joyas familiares antiguas en diseños contemporáneos o crear piezas únicas personalizadas. ✨',
    category: 'VENTAS'
  }
];