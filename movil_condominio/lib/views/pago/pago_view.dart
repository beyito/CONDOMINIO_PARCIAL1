import 'package:flutter/material.dart';
import 'package:movil_condominio/models/pago_model.dart';
import 'package:movil_condominio/services/pago_service.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:movil_condominio/services/reservaCopropietario_service.dart';

class PagoView extends StatefulWidget {
  const PagoView({super.key});
  @override
  State<PagoView> createState() => _PagoViewState();
}

class _PagoViewState extends State<PagoView> {
  late Future<List<PagoModel>> _pagosFuture;
  final PagoService _service = PagoService();
  @override
  void initState() {
    super.initState();
    // Aquí deberías pasar el token real
    _pagosFuture = _service.mostrarPagosCopropietario();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mis Pagos")),
      body: FutureBuilder<List<PagoModel>>(
        future: _pagosFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }
          final pagos = snapshot.data!;
          if (pagos.isEmpty) {
            return const Center(child: Text("No tienes pagos registrados"));
          }
          return RefreshIndicator(
            onRefresh: () async {
              // Reasignamos el Future para que se recargue la lista
              setState(() {
                _pagosFuture = _service.mostrarPagosCopropietario();
              });
            },
            child: ListView.builder(
              itemCount: pagos.length,
              itemBuilder: (context, index) {
                final pago = pagos[index];
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ListTile(
                          title: Text(pago.descripcion),
                          subtitle: Text(
                            "Fecha: ${pago.fechaEmision}\nEstado: ${pago.estado}\nMonto: ${pago.monto.toStringAsFixed(2)}",
                          ),
                          trailing: Text(
                            pago.tipoPago ?? "N/A",
                            style: TextStyle(
                              color: pago.estado == "pagado"
                                  ? Colors.green
                                  : pago.estado == "pendiente"
                                  ? Colors.orange
                                  : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        // Botón condicional
                        if (pago.estado == "no pagado")
                          ElevatedButton.icon(
                            onPressed: () {
                              _showAdjuntarDialog(pago.id);
                              // Lógica para adjuntar comprobante
                            },
                            icon: const Icon(Icons.upload_file),
                            label: const Text("Adjuntar Comprobante"),
                          )
                        else if (pago.estado == "pendiente")
                          ElevatedButton.icon(
                            onPressed: () {
                              _showAdjuntarDialog(
                                pago.id,
                              ); // Lógica para cambiar comprobante
                            },
                            icon: const Icon(Icons.edit),
                            label: const Text("Cambiar Comprobante"),
                          ),
                        // No mostrar botón si está "pagado" o "cancelada"
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showAdjuntarDialog(int idPago) async {
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

                if (idPago != null) {
                  final reservaService = ReservaCopropietarioService();
                  final result = await _service.adjuntarComprobante(
                    idPago,
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
                  _pagosFuture = _service.mostrarPagosCopropietario();
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
