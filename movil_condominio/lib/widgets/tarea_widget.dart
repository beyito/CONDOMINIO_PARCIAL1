import 'package:flutter/material.dart';
import 'package:movil_condominio/models/tarea_model.dart';
import 'package:movil_condominio/services/tarea_service.dart';

class TareaWidget extends StatelessWidget {
  final TareaModel tarea;

  const TareaWidget({super.key, required this.tarea});

  Future<void> _marcarAccion(BuildContext context) async {
    try {
      if (tarea.estado?.toLowerCase() == "pendiente") {
        await TareaService().marcarTarea(tarea.id!);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Tarea realizada correctamente")),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No se puede marcar en este estado")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tarea
            Text(
              tarea.tarea ?? "",
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Descripción
            Row(
              children: [
                Icon(Icons.description, size: 18, color: Colors.blue[800]),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    tarea.descripcion ?? "",
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Personal
            Row(
              children: [
                Icon(Icons.person, size: 18, color: Colors.green[700]),
                const SizedBox(width: 6),
                Text(
                  tarea.personal ?? "",
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Fecha asignación
            Row(
              children: [
                Icon(Icons.event, size: 18, color: Colors.amber[800]),
                const SizedBox(width: 6),
                Text(
                  tarea.fecha_asignacion ?? "",
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Hora realización
            Row(
              children: [
                Icon(Icons.access_time, size: 18, color: Colors.grey[700]),
                const SizedBox(width: 6),
                Text(
                  tarea.hora_realizacion ?? "No realizada",
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Estado
            Row(
              children: [
                Icon(Icons.flag, size: 18, color: Colors.red[700]),
                const SizedBox(width: 6),
                Text(tarea.estado ?? "", style: const TextStyle(fontSize: 14)),
              ],
            ),

            const SizedBox(height: 14),

            // Mostrar botón solo si el estado es pendiente
            if (tarea.estado?.toLowerCase() == "pendiente")
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.check),
                  label: const Text("Marcar como realizada"),
                  onPressed: () => _marcarAccion(context),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
