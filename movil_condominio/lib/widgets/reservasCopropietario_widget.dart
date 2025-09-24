import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:movil_condominio/models/reserva_model.dart';
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
  late Future<List<ReservaModel>> _futureReservas;
  // Eliminado: declaración incorrecta de textoComprobante

  @override
  void initState() {
    super.initState();
    _futureReservas = _service.mostrarReservasCopropietario();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<ReservaModel>>(
      future: _futureReservas,
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

        return RefreshIndicator(
          onRefresh: () async {
            // Reasignamos el Future para que se recargue la lista
            setState(() {
              _futureReservas = _service.mostrarReservasCopropietario();
            });
          },
          child: ListView.builder(
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            reserva.nombre_area.toString(),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            reserva.estado ?? "",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color:
                                  reserva.estado?.toLowerCase() == "cancelada"
                                  ? Colors.red
                                  : Colors.green,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "Horario: ${reserva.hora_inicio} - ${reserva.hora_fin}",
                      ),
                      Text("Día: ${reserva.fecha}"),
                      Text("Motivo de la Reserva: ${reserva.nota}"),
                      const SizedBox(height: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Botón Cancelar
                          if (reserva.estado?.toLowerCase() != "cancelada")
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color.fromARGB(
                                  255,
                                  230,
                                  108,
                                  99,
                                ),
                              ),
                              onPressed: () => _showCancelarDialog(reserva),
                              child: const Text("Cancelar Reserva"),
                            ),
                          const SizedBox(height: 8),
                          // Mostrar el texto del comprobante y botón Adjuntar Comprobante
                          if (reserva.estado?.toLowerCase() == "pendiente")
                            ElevatedButton(
                              onPressed: () => _showAdjuntarDialog(reserva),
                              child: Text(
                                reserva.url_comprobante == null
                                    ? "Adjuntar Comprobante"
                                    : "Cambiar Comprobante",
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  // ----------------- DIALOGO CANCELAR -----------------
  void _showCancelarDialog(ReservaModel reserva) {
    final TextEditingController motivoController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Cancelar Reserva"),
        content: TextField(
          controller: motivoController,
          decoration: const InputDecoration(
            hintText: "Ingrese el motivo de cancelación",
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancelar"),
          ),
          ElevatedButton(
            onPressed: () async {
              final motivo = motivoController.text.trim();
              if (motivo.isEmpty) return;
              final result = await _service.cancelarReserva(
                reserva.id_reserva as int,
                motivo,
              );
              if (result['status'] == 1) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("Reserva Cancelada Exitosamente"),
                    backgroundColor: Colors.green,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("No se pudo cancelar la reserva"),
                    backgroundColor: Colors.red,
                  ),
                );
              }
              setState(() {
                _futureReservas = _service.mostrarReservasCopropietario();
              });

              Navigator.pop(context);
            },
            child: const Text("Confirmar"),
          ),
        ],
      ),
    );
  }

  // ----------------- DIALOGO ADJUNTAR -----------------
  void _showAdjuntarDialog(ReservaModel reserva) async {
    XFile? pickedFile;
    final ImagePicker picker = ImagePicker();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          title: const Text("Adjuntar Comprobante"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ElevatedButton(
                onPressed: () async {
                  pickedFile = await picker.pickImage(
                    source: ImageSource.gallery,
                  );
                  setStateDialog(() {}); // ✅ actualiza solo el diálogo
                },
                child: const Text("Seleccionar Imagen"),
              ),
              if (pickedFile != null)
                Text("Archivo seleccionado: ${pickedFile!.name}"),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancelar"),
            ),
            ElevatedButton(
              onPressed: () async {
                if (pickedFile == null) return;

                File file = File(pickedFile!.path);

                if (reserva.id_reserva != null) {
                  final result = await _service.adjuntarComprobante(
                    reserva.id_reserva as int,
                    file,
                  );

                  // ✅ Manejar respuesta del backend
                  if (result['status'] == 1) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          "✅ Comprobante subido: ${result['url_comprobante']}",
                        ),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("❌ Error: ${result['message']}"),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }

                setState(() {
                  _futureReservas = _service.mostrarReservasCopropietario();
                });
                Navigator.pop(context);
              },
              child: const Text("Subir"),
            ),
          ],
        ),
      ),
    );
  }
}
