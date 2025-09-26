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
    _cargarPersonas();
  }

  void _cargarPersonas() {
    setState(() {
      _personasFuture = _service.fetchPersonas();
    });
  }

  // 👉 Modal para agregar nueva persona
  void _agregarPersona() async {
    final nombreController = TextEditingController();
    final apellidoController = TextEditingController();
    final documentoController = TextEditingController();

    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Agregar nueva persona'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                TextField(
                  controller: nombreController,
                  decoration: InputDecoration(labelText: 'Nombre'),
                ),
                TextField(
                  controller: apellidoController,
                  decoration: InputDecoration(labelText: 'Apellido'),
                ),
                TextField(
                  controller: documentoController,
                  decoration: InputDecoration(labelText: 'CI'),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nombreController.text.isNotEmpty &&
                    apellidoController.text.isNotEmpty &&
                    documentoController.text.isNotEmpty) {
                  final success = await _service.crearPersona(
                    nombre: nombreController.text,
                    apellido: apellidoController.text,
                    documento: documentoController.text,
                  );

                  if (success) {
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('✅ Persona agregada')),
                      );
                      _cargarPersonas(); // refrescar lista
                    }
                  } else {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('❌ No se pudo agregar')),
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
                      Navigator.pop(context);
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
      appBar: AppBar(
        title: Text('Personas registradas'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _agregarPersona, // 👉 botón + arriba
          ),
        ],
      ),
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
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                elevation: 3,
                margin: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Row(
                    children: [
                      // Columna con datos de la persona
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${persona.nombre} ${persona.apellido}',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 6),
                            Text(
                              'CI: ${persona.documento}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[700],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Botón de invitar
                      ElevatedButton(
                        onPressed: () => _invitarCondominio(persona),
                        style: ElevatedButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                        ),
                        child: Text('Invitar'),
                      ),
                    ],
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
