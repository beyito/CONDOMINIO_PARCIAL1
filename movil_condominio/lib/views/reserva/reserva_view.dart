import 'package:flutter/material.dart';
import 'package:movil_condominio/services/calendario_service.dart';

class ReservaView extends StatefulWidget {
  final String area;
  final DateTime fecha;

  const ReservaView({super.key, required this.area, required this.fecha});

  @override
  State<ReservaView> createState() => _ReservaPageState();
}

Future<Map<String, TimeOfDay>?> seleccionarHorario(
  BuildContext context,
  TimeOfDay horaInicioDisponible,
  TimeOfDay horaFinDisponible,
) async {
  TimeOfDay selectedInicio = horaInicioDisponible;
  TimeOfDay selectedFin = horaFinDisponible;

  return showModalBottomSheet<Map<String, TimeOfDay>>(
    context: context,
    isScrollControlled: true,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setState) {
          return Padding(
            padding: MediaQuery.of(context).viewInsets,
            child: Container(
              height: 300,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text(
                    "Seleccione horario",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Hora de inicio
                      Column(
                        children: [
                          const Text("Inicio"),
                          DropdownButton<int>(
                            value: selectedInicio.hour,
                            items: [
                              for (
                                int h = horaInicioDisponible.hour;
                                h <= horaFinDisponible.hour;
                                h++
                              )
                                DropdownMenuItem(
                                  value: h,
                                  child: Text(h.toString().padLeft(2, '0')),
                                ),
                            ],
                            onChanged: (v) {
                              if (v != null) {
                                setState(() {
                                  selectedInicio = TimeOfDay(
                                    hour: v,
                                    minute: selectedInicio.minute,
                                  );
                                  if (selectedFin.hour < selectedInicio.hour) {
                                    selectedFin = selectedInicio;
                                  }
                                });
                              }
                            },
                          ),
                          DropdownButton<int>(
                            value: selectedInicio.minute,
                            items: [
                              for (int m = 0; m < 60; m += 5)
                                DropdownMenuItem(
                                  value: m,
                                  child: Text(m.toString().padLeft(2, '0')),
                                ),
                            ],
                            onChanged: (v) {
                              if (v != null) {
                                setState(() {
                                  selectedInicio = TimeOfDay(
                                    hour: selectedInicio.hour,
                                    minute: v,
                                  );
                                  if (selectedFin.hour < selectedInicio.hour ||
                                      (selectedFin.hour ==
                                              selectedInicio.hour &&
                                          selectedFin.minute <=
                                              selectedInicio.minute)) {
                                    selectedFin = selectedInicio;
                                  }
                                });
                              }
                            },
                          ),
                        ],
                      ),
                      const SizedBox(width: 40),
                      // Hora de fin
                      Column(
                        children: [
                          const Text("Fin"),
                          DropdownButton<int>(
                            value: selectedFin.hour,
                            items: [
                              for (
                                int h = selectedInicio.hour;
                                h <= horaFinDisponible.hour;
                                h++
                              )
                                DropdownMenuItem(
                                  value: h,
                                  child: Text(h.toString().padLeft(2, '0')),
                                ),
                            ],
                            onChanged: (v) {
                              if (v != null) {
                                setState(() {
                                  selectedFin = TimeOfDay(
                                    hour: v,
                                    minute: selectedFin.minute,
                                  );
                                });
                              }
                            },
                          ),
                          DropdownButton<int>(
                            value: selectedFin.minute,
                            items: [
                              for (int m = 0; m < 60; m += 5)
                                DropdownMenuItem(
                                  value: m,
                                  child: Text(m.toString().padLeft(2, '0')),
                                ),
                            ],
                            onChanged: (v) {
                              if (v != null) {
                                setState(() {
                                  selectedFin = TimeOfDay(
                                    hour: selectedFin.hour,
                                    minute: v,
                                  );
                                });
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      if ((selectedFin.hour < selectedInicio.hour) ||
                          (selectedFin.hour == selectedInicio.hour &&
                              selectedFin.minute <= selectedInicio.minute)) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              "La hora de fin debe ser mayor que la de inicio",
                            ),
                          ),
                        );
                        return;
                      }
                      Navigator.pop(context, {
                        'inicio': selectedInicio,
                        'fin': selectedFin,
                      });
                    },
                    child: const Text("Aceptar"),
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
                    onPressed: () async {
                      final horaInicioDisponible = TimeOfDay(
                        hour: int.parse(h['hora_inicio'].split(':')[0]),
                        minute: int.parse(h['hora_inicio'].split(':')[1]),
                      );
                      final horaFinDisponible = TimeOfDay(
                        hour: int.parse(h['hora_fin'].split(':')[0]),
                        minute: int.parse(h['hora_fin'].split(':')[1]),
                      );

                      final horarioSeleccionado = await seleccionarHorario(
                        context,
                        horaInicioDisponible,
                        horaFinDisponible,
                      );

                      if (horarioSeleccionado != null) {
                        final inicio = horarioSeleccionado['inicio']!;
                        final fin = horarioSeleccionado['fin']!;

                        print(
                          "Reservar ${widget.area} de ${inicio.hour.toString().padLeft(2, '0')}:${inicio.minute.toString().padLeft(2, '0')} "
                          "a ${fin.hour.toString().padLeft(2, '0')}:${fin.minute.toString().padLeft(2, '0')} "
                          "el ${widget.fecha}",
                        );
                      }
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
