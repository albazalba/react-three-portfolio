# Hall improvement plan

The walkable space is now an apartment: living room, study with the project wall, and game room. The dressing room is closed for now (`DRESSING_ROOM` in `components/museum/layout.ts` reopens it). The notes below describe the earlier gallery pass.



The walkable hall at the site root is a gallery built from boxes, cylinders, and spheres. Lighting and edges were already lifted. The next gain is real objects, room-by-room character, and work that stays readable while you walk. Content stays on the existing site data. Nothing in a biography is invented.

This document is the build order.

Phase 1 is in the hall: the gallery bench, the planter, the picture frame, and the pedestal, modeled in Blender and exported to `public/museum/models/`. Arcade cabinets, the desk, hobby objects, project images, and door casings are the later phases.

## What is weak now

- Furniture is primitive. Benches are a plank and two blocks. Plants are three spheres in a cylinder. Frames are flat boxes. Pedestals are cubes. The arcade cabinets, desk, chairs, shelf, globe, and tripod are the same kind of stand-in.
- Wide rooms (24 m) hide wall art. A 66° view down the center only covers about ±6 m at 12 m away, so frames were pulled into the aisles. Side walls still read as empty colored panels.
- Rooms share one warm-grey material language. Experience, projects, the arcade, hobbies, and the desk should be recognizable before you read a label.
- Project “paintings” are solid colors. The site already has project images. They are not on the frames.
- The portrait is a square full-body photo on a slab, and it blocks the center aisle.
- Collision is correct and must stay correct. New meshes cannot grow past the existing blockers, and door gaps must stay wider than the player (radius 0.34 m).

## Rules for every change

- One meter in Blender is one meter in the hall. Eye height stays 1.64 m.
- Models sit on the floor, origin at the object’s footprint center, unless a wall piece is marked otherwise.
- A new mesh must fit inside the collider already published for that object. If a model needs to be larger, the collider is updated in the same change and the walk is rechecked.
- Aisles stay open. The center line of the foyer, atrium, experience, and projects is a walking path, not a place for a new solid.
- Rooms stay bright. No dark fog, no heavy vignette, no shadows that turn walls black. Brass can be metal only because the studio environment is already in the scene.
- Copy comes from `data/site.ts`: experience, projects, principles, toolkit, hobbies already on the site, and the published contact links. New room dressing can be generic gallery objects. It cannot add jobs, projects, or hobbies that are not on the site.
- The written pages (`/about`, `/experience`, `/work`, `/contact`, `/insights`) stay as the reading-room fallback.

## Shared object kit

These models are built once in Blender and reused. Counts are what the hall already places.

| Model | Used for | Size limit | Notes |
| --- | --- | --- | --- |
| Gallery bench | 8 benches | 1.60 × 0.56 m footprint | Seat near 0.45 m. Wood top, brass legs and stretcher. |
| Planter | 14 plants | 0.68 m diameter | Stone pot, brass lip, a plant with leaves rather than stacked spheres. Height under 1.1 m so it does not cover frames. |
| Picture frame | 10 projects, 5 hobbies | Opening for a 1.50 × 1.15 m canvas on projects | Bevel, mat, brass outer edge. The canvas and the title stay in the page so each project can differ. |
| Pedestal | 3 jobs, plus small plinths | Job pedestal about 0.82 m square and 1.05 m tall | Stone shaft, brass cap. Job title stays as text above it. |
| Arcade cabinet | 2 playable cabinets plus 2 extra machines | Fit the current cabinet footprint | Screen faces into the room. Playable machines keep their click targets. |
| Stool | 2 | 0.56 m diameter | Low seat in front of the machines. |
| Desk and chair | Contact room | Desk top already about 1.7 × 0.78 m | A writing desk, two chairs, a rug. The contact action stays on the desk. |
| Shelf | Hobbies and contact | Current shelf colliders | A few books and objects, not a wall of text. |
| Camera and globe | One each, hobbies | Current colliders | Photography and travel, which are already hobbies on the site. |
| Wall panel | Side walls | Flat, no new collider | A framed textile or print so long walls are not a single color slab. |

Export each as a `.glb` in `public/museum/models/`. The page instances them. Materials are Principled surfaces: wood roughness around 0.45, stone around 0.6, brass metalness around 0.9 and roughness around 0.28. No baked lighting inside the file, so the hall lights still own the look.

## Room by room

### Entrance and atrium

The first view is the portrait, the columns, and the name. Keep the skylight bright. Replace the benches and planters with the kit. Give the portrait a real plinth and a frame, and move the solid of that plinth off the exact center if a shoulder still clips the aisle. Side panels become framed works, not flat color cards. Principles and toolkit stay as the two side stops.

### Experience

Cooler stone than the atrium, same brass. Three pedestals, one per role already in the site data, set in the aisle so a 66° view sees them. Benches and planters from the kit. A short brass line in the floor, already present, is enough wayfinding. Do not add extra job stories.

### Projects

This is the long gallery past experience. Ten frames in two aisles, facing back toward the entrance. Swap the box frames for the beveled frame. Put each project’s existing image on the canvas when a reasonably sized file is available. If an image is huge, make a smaller copy for the texture. Titles and years stay on the frame. Benches and the three small sculptures use the kit so the aisle is furnished without blocking the walk from frame to frame.

### Arcade

Blue-grey room, brighter than it was. Two playable cabinets (Signal Match and Light Chase) plus two extra machines along the far wall so the view is not an empty wall. Neon stays as light, not as geometry that sticks into the walk. Stools in front of the playable machines. The chase orbs stay in open floor.

### Hobbies

Five frames for photography, travel, markets, product design, and technology. Same frame model as projects, smaller. The camera and globe mark photography and travel. The shelf holds objects, not paragraphs. Benches face the frames.

### Correspondence

The lowest, warmest room. Desk, two chairs, rug, shelf, one planter, one small sculpture. The “get in touch” stop stays in front of the desk. No new contact methods beyond the email, GitHub, and LinkedIn already published.

## Hall shell

Keep the plan. Do not redraw the rooms. Improvements on the shell, after the objects:

- Baseboards and a thin brass crown are already in. Next is a door casing around each opening so a door reads as a door.
- Column shafts can stay procedural if the segment count stays high. Bases and capitals should match the brass used on the frames.
- Floors keep the light stone sheen. A second, quieter texture per room is enough. Do not mirror the floor.
- One soft contact shadow under objects, only if it does not darken the walls. The current fill lights stay.

## Build order

1. **Kit, now.** Bench, planter, frame, and pedestal. Export, drop them into the hall, walk the atrium, experience, and projects. This is the change you see first.
2. **Arcade and desk.** Cabinet, stool, desk, chair.
3. **Hobbies and walls.** Camera, globe, shelf, wall panel. Project images on the canvases.
4. **Shell.** Door casings, column capital, per-room floor tone.
5. **Check.** Walk every door. Confirm landmarks are not inside a collider. Confirm the gate, the directory, both games, and the contact card still open. Look at a desktop width and a phone width.

## Out of scope

- A new floor plan, physics engine, or multiplayer.
- Dark “museum at night” grading.
- Biography, clients, or hobbies that are not already on the site.
- Replacing the written pages.
