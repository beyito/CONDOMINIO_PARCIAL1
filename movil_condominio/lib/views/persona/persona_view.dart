import 'package:flutter/material.dart';
import 'package:movil_condominio/models/persona_model.dart';
import 'package:movil_condominio/services/persona_service.dart';

class ListaPersonasView extends StatefulWidget {
  const ListaPersonasView({super.key});
  @override
  ListaPersonasViewState createState() => ListaPersonasViewState();
}

class ListaPersonasViewState extends State<ListaPersonasView> {
  late Future<List<Persona>> _personasFuture;
  final PersonaService _service = PersonaService();

  @override
  void initState() {
    super.initState();
    _personasFuture = _service.fetchPersonas();
  }

  void _invitarCondominio(Persona persona) async {
    DateTime? fechaInicio;
    DateTime? fechaFin;
    final motivoController = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Invitar a ${persona.nombre}'),
          content: StatefulBuilder(
            builder: (context, setState) {
              return SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Fecha Inicio
                    ListTile(
                      title: Text(
                        fechaInicio == null
                            ? 'Seleccionar fecha y hora de inicio'
                            : 'Inicio: ${fechaInicio.toString()}',
                      ),
                      trailing: Icon(Icons.calendar_today),
                      onTap: () async {
                        final fecha = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2100),
                        );
                        if (fecha != null) {
                          final hora = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (hora != null) {
                            setState(() {
                              fechaInicio = DateTime(
                                fecha.year,
                                fecha.month,
                                fecha.day,
                                hora.hour,
                                hora.minute,
                              );
                            });
                          }
                        }
                      },
                    ),

                    // Fecha Fin
                    ListTile(
                      title: Text(
                        fechaFin == null
                            ? 'Seleccionar fecha y hora de fin'
                            : 'Fin: ${fechaFin.toString()}',
                      ),
                      trailing: Icon(Icons.calendar_today),
                      onTap: () async {
                        final fecha = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2100),
                        );
                        if (fecha != null) {
                          final hora = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (hora != null) {
                            setState(() {
                              fechaFin = DateTime(
                                fecha.year,
                                fecha.month,
                                fecha.day,
                                hora.hour,
                                hora.minute,
                              );
                            });
                          }
                        }
                      },
                    ),

                    // Motivo
                    TextField(
                      controller: motivoController,
                      decoration: InputDecoration(
                        labelText: 'Motivo de la visita',
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (fechaInicio != null &&
                    fechaFin != null &&
                    motivoController.text.isNotEmpty) {
                  final success = await _service.registrarVisita(
                    personaId: persona.id,
                    fechaInicio: fechaInicio!,
                    fechaFin: fechaFin!,
                    motivo: motivoController.text,
                  );

                  if (success) {
                    if (context.mounted) {
                      Navigator.pop(context); // cerrar modal
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('✅ Se invitó exitosamente')),
                      );
                    }
                  } else {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('❌ No se pudo invitar')),
                      );
                    }
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('⚠️ Completa todos los campos')),
                  );
                }
              },
              child: Text('Guardar'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Personas registradas')),
      body: FutureBuilder<List<Persona>>(
        future: _personasFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text('No hay personas registradas'));
          }

          final personas = snapshot.data!;

          return ListView.builder(
            itemCount: personas.length,
            itemBuilder: (context, index) {
              final persona = personas[index];
              return Card(
                margin: EdgeInsets.all(8),
                child: ListTile(
                  title: Text('${persona.nombre} ${persona.apellido}'),
                  subtitle: Text('CI: ${persona.documento}'),
                  trailing: ElevatedButton(
                    onPressed: () => _invitarCondominio(persona),
                    child: Text('Invitar al condominio'),
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
