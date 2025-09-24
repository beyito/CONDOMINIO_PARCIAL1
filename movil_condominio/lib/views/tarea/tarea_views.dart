import 'package:flutter/material.dart';
import 'package:movil_condominio/services/tarea_service.dart';
import 'package:movil_condominio/models/tarea_model.dart';
import 'package:movil_condominio/widgets/tarea_widget.dart';

class TareaView extends StatefulWidget {
  const TareaView({super.key});

  @override
  State<TareaView> createState() => _TareaViewState();
}

class _TareaViewState extends State<TareaView> {
  final TareaService _service = TareaService();
  late Future<List<TareaModel>> _futureTareas;

  @override
  void initState() {
    super.initState();
    _futureTareas = _service.mostrarTareas();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Tareas",
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: Colors.blueAccent,
      ),
      body: FutureBuilder<List<TareaModel>>(
        future: _futureTareas,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }
          final tareas = snapshot.data ?? [];
          if (tareas.isEmpty) {
            return const Center(child: Text("No hay visitas registradas."));
          }
          return RefreshIndicator(
            onRefresh: () async {
              // Nueva petición al backend:
              setState(() {
                _futureTareas = _service.mostrarTareas();
              });
              // Espera a que el future termine antes de quitar el loader de pull-to-refresh
              await _futureTareas;
            },
            child: ListView.builder(
              itemCount: tareas.length,
              itemBuilder: (context, index) =>
                  TareaWidget(tarea: tareas[index]),
            ),
          );
        },
      ),
    );
  }
}
