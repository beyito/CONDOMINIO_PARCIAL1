import 'package:flutter/material.dart';
import 'package:movil_condominio/models/reserva_model.dart';
// import 'package:movil_condominio/models/areacomun_model.dart';
// import 'package:movil_condominio/services/areacomun_service.dart';
import 'package:movil_condominio/services/reservaCopropietario_service.dart';

class ReservasCopropietarioWidget extends StatefulWidget {
  const ReservasCopropietarioWidget({super.key});

  @override
  State<ReservasCopropietarioWidget> createState() =>
      _ReservasCopropietarioWidgetState();
}

class _ReservasCopropietarioWidgetState
    extends State<ReservasCopropietarioWidget> {
  final ReservaCopropietarioService _service = ReservaCopropietarioService();

  late Future<List<ReservaModel>> _futureAreas;

  @override
  void initState() {
    super.initState();
    _futureAreas = _service.mostrarReservasCopropietario();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ReservaModel>>(
      future: _futureAreas,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Text(
              "Error: ${snapshot.error}",
              style: const TextStyle(color: Colors.red),
            ),
          );
        }

        final reservas = snapshot.data ?? [];

        if (reservas.isEmpty) {
          return const Center(
            child: Text("No hiciste ninguna reserva todavía"),
          );
        }

        return ListView.builder(
          itemCount: reservas.length,
          itemBuilder: (context, index) {
            final reserva = reservas[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              elevation: 3,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reserva.nombre_area.toString(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      "Horario: ${reserva.hora_inicio} - ${reserva.hora_fin}",
                    ),
                    Text("Día: ${reserva.fecha}"),
                    Text("Estado de la Reserva: ${reserva.estado}"),
                    Text("Motivo de la Reserva: ${reserva.nota}"),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ElevatedButton(
                          onPressed: () async {},
                          child: const Text("Adjuntar Comprobante"),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
