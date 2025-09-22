import 'package:flutter/material.dart';
import 'package:movil_condominio/services/calendario_service.dart';

class ReservaView extends StatefulWidget {
  final String area;
  final DateTime fecha;

  const ReservaView({super.key, required this.area, required this.fecha});

  @override
  State<ReservaView> createState() => _ReservaPageState();
}

class _ReservaPageState extends State<ReservaView> {
  final CalendarioService _service = CalendarioService();
  late Future<List<Map<String, dynamic>>> _futureHorarios;

  @override
  void initState() {
    super.initState();
    _futureHorarios = _service.obtenerDisponibilidad(
      area: widget.area,
      fecha: widget.fecha,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Reservar: ${widget.area}")),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _futureHorarios,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          final horarios = snapshot.data ?? [];

          if (horarios.isEmpty) {
            return const Center(child: Text("No hay horarios disponibles"));
          }

          return ListView.builder(
            itemCount: horarios.length,
            itemBuilder: (context, index) {
              final h = horarios[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: ListTile(
                  title: Text("${h['hora_inicio']} - ${h['hora_fin']}"),
                  trailing: ElevatedButton(
                    onPressed: () {
                      // Aquí podrías llamar al servicio de reservar
                      print(
                        "Reservar ${widget.area} de ${h['hora_inicio']} a ${h['hora_fin']} en ${widget.fecha}",
                      );
                    },
                    child: const Text("Seleccionar"),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
