import 'package:flutter/material.dart';
import 'package:movil_condominio/widgets/areacomun_widget.dart'; // <- ruta correcta

class AreasComunesView extends StatelessWidget {
  const AreasComunesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Áreas Comunes",
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.blueAccent,
      ),
      body: const AreasComunesWidget(), // <- Aquí llamas tu widget
    );
  }
}
