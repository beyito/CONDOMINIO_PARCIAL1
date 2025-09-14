import 'package:flutter/material.dart';
import 'package:movil_condominio/models/noticia_model.dart';

class NoticiaWidget extends StatelessWidget {
  final NoticiaModel noticia;

  const NoticiaWidget({super.key, required this.noticia});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 18, horizontal: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      elevation: 7,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen superior
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: Image.network(
              noticia.imagen_Url ?? "",
              width: double.infinity,
              height: 220,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey[300],
                height: 220,
                width: double.infinity,
                child: const Icon(Icons.image, size: 60, color: Colors.grey),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  noticia.titulo ?? "",
                  style: const TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Creado: ${noticia.creadoEn}',
                  style: const TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              noticia.descripcion ?? "",
              style: const TextStyle(fontSize: 13),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              bottom: 12,
              top: 4,
            ),
            child: Row(
              children: [
                const Spacer(),
                const Icon(Icons.person, size: 17, color: Colors.grey),
                const SizedBox(width: 5),
                Text(
                  noticia.administrador ?? "",
                  // [
                  //   if (noticia.administrador != null) noticia.administrador,
                  // ].where((s) => s != null && s.isNotEmpty).join(' '),
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
