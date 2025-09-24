import 'package:flutter/material.dart';
// import 'package:movil_condominio/models/autorizacion_visita_model.dart';
// importa tu servicio de API
import 'package:movil_condominio/services/tarea_service.dart';
import 'package:movil_condominio/models/tarea_model.dart';

class TareaWidget extends StatelessWidget {
  final TareaModel tarea;

  const TareaWidget({super.key, required this.tarea});

  Future<void> _marcarAccion(BuildContext context) async {
    try {
      if (tarea.estado == "Pendiente") {
        // await TareaService().marcarTarea(tarea.id!);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Entrada marcada correctamente")),
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
    String buttonText = "";
    IconData buttonIcon = Icons.help_outline;

    if (tarea.estado == "Pendiente") {
      buttonText = "Marcar entrada";
      buttonIcon = Icons.login;
    } else if (tarea.estado == "En Visita") {
      buttonText = "Marcar salida";
      buttonIcon = Icons.logout;
    } else {
      buttonText = "Ya se hizo la visita";
      buttonIcon = Icons.visibility;
    }

    return Card(
      // margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      // shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      // elevation: 4,
      // child: Padding(
      //   padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      //   child: Column(
      //     crossAxisAlignment: CrossAxisAlignment.start,
      //     children: [
      //       Text(
      //         'Visita #${tarea.id}',
      //         style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      //       ),
      //       const SizedBox(height: 8),
      //       Row(
      //         children: [
      //           Icon(Icons.access_time, size: 17, color: Colors.blue[800]),
      //           const SizedBox(width: 5),
      //           Text(
      //             '${tarea.horaInicio?.hour ?? "--:--"} - ${tarea.horaFin?.hour ?? "--:--"}',
      //             style: const TextStyle(fontSize: 11),
      //           ),
      //         ],
      //       ),
      //       const SizedBox(height: 6),
      //       if (tarea.motivo_visita != null && tarea.motivo_visita!.isNotEmpty)
      //         Row(
      //           children: [
      //             Icon(Icons.note, size: 17, color: Colors.amber[900]),
      //             const SizedBox(width: 5),
      //             Expanded(
      //               child: Text(
      //                 tarea.motivo_visita!,
      //                 style: const TextStyle(
      //                   fontSize: 14,
      //                   color: Colors.black87,
      //                 ),
      //               ),
      //             ),
      //           ],
      //         ),
      //       const SizedBox(height: 6),
      //       Row(
      //         children: [
      //           Icon(Icons.person, size: 17, color: Colors.green[800]),
      //           const SizedBox(width: 5),
      //           Text(
      //             'Copropietario: ${tarea.nombreCopropietario ?? "?"}',
      //             style: const TextStyle(fontSize: 14),
      //           ),
      //         ],
      //       ),
      //       const SizedBox(height: 6),
      //       Row(
      //         children: [
      //           Icon(Icons.account_box, size: 17, color: Colors.grey[800]),
      //           const SizedBox(width: 5),
      //           Text(
      //             'Invitado: ${tarea.nombrePersona ?? "?"}',
      //             style: const TextStyle(fontSize: 14),
      //           ),
      //         ],
      //       ),
      //       const SizedBox(height: 10),
      //       Align(
      //         alignment: Alignment.centerRight,
      //         child: ElevatedButton.icon(
      //           icon: Icon(buttonIcon),
      //           label: Text(buttonText),
      //           onPressed: () {
      //             if (tarea.estado == "Pendiente" ||
      //                 tarea.estado == "En Visita") {
      //               _marcarAccion(context);
      //             } else {
      //               // Mostrar mensaje cuando ya se completó la visita
      //               ScaffoldMessenger.of(context).showSnackBar(
      //                 const SnackBar(content: Text("Ya se hizo la visita")),
      //               );
      //             }
      //           },
      //         ),
      //       ),
      //     ],
      //   ),
      // ),
    );
  }
}
