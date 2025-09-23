import 'package:flutter/material.dart';
// import 'package:movil_condominio/widgets/areacomun_widget.dart'; // <- ruta correcta
import 'package:movil_condominio/widgets/reservasCopropietario_widget.dart';

class ReservaCopropietarioView extends StatelessWidget {
  const ReservaCopropietarioView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Mis Reservas",
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.blueAccent,
      ),
      body: const ReservasCopropietarioWidget(), // <- Aquí llamas tu widget
    );
  }
}
