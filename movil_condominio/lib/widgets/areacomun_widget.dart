import 'package:flutter/material.dart';
import 'package:movil_condominio/models/areacomun_model.dart';
import 'package:movil_condominio/services/areacomun_service.dart';
import 'package:movil_condominio/views/reserva/reserva_view.dart';

class AreasComunesWidget extends StatefulWidget {
  const AreasComunesWidget({super.key});

  @override
  State<AreasComunesWidget> createState() => _AreasComunesWidgetState();
}

class _AreasComunesWidgetState extends State<AreasComunesWidget> {
  final AreaComunService _service = AreaComunService();

  late Future<List<AreaComunModel>> _futureAreas;

  @override
  void initState() {
    super.initState();
    _futureAreas = _service.mostrarAreasComunes();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<AreaComunModel>>(
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

        final areas = snapshot.data ?? [];

        if (areas.isEmpty) {
          return const Center(child: Text("No hay áreas comunes disponibles"));
        }

        return ListView.builder(
          itemCount: areas.length,
          itemBuilder: (context, index) {
            final area = areas[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              elevation: 3,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      area.nombre_area.toString(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text("Capacidad: ${area.capacidad}"),
                    Text(
                      "Horario: ${area.apertura_hora} - ${area.cierre_hora}",
                    ),
                    Text("Días: ${area.dias_habiles}"),
                    Text("Reglas: ${area.reglas}"),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        area.requiere_pago ?? false
                            ? Text(
                                "Bs ${(area.precio_por_bloque ?? 0.00).toStringAsFixed(2)}",
                                style: const TextStyle(
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              )
                            : const Text(
                                "Gratis",
                                style: TextStyle(
                                  color: Colors.green,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                        ElevatedButton(
                          onPressed: () async {
                            // Abrir selector de fecha
                            DateTime? fechaSeleccionada = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(
                                const Duration(days: 365),
                              ),
                            );
                            final fechaStr =
                                "${fechaSeleccionada?.year.toString().padLeft(4, '0')}-"
                                "${fechaSeleccionada?.month.toString().padLeft(2, '0')}-"
                                "${fechaSeleccionada?.day.toString().padLeft(2, '0')}";
                            print(fechaStr.toString());

                            if (fechaSeleccionada != null) {
                              // Navegar a la pantalla de reserva pasando el área y la fecha
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ReservaView(
                                    area: area.nombre_area ?? "",
                                    fecha: fechaSeleccionada,
                                  ),
                                ),
                              );
                            }
                          },
                          child: const Text("Reservar"),
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
