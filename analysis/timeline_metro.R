# Hylian Palette -- Zelda timeline metro map
#
# NOT the release-order timeline already in the README (that one's a plain
# Mermaid chart). This one shows in-universe STORY chronology per Nintendo's
# official Hyrule Historia timeline -- the one every fan means by "the
# timeline," famous specifically for the reveal that The Legend of Zelda
# (1986) and Zelda II are placed in the far FUTURE of one branch, not the
# past. Listing which game's story follows which is factual/historical
# chronology information (like a list of film release dates), not
# copyrightable creative expression -- this is an original rendering built
# from scratch in this project's own visual style and its own established
# per-game identity colors (palettes/*.js `accentCursor`), not copied from
# any published chart.
#
# Run from the repo root with: Rscript --vanilla analysis/timeline_metro.R

library(ggplot2)
library(dplyr)

dir.create("assets/timeline", showWarnings = FALSE, recursive = TRUE)

# x = schematic story order (not real years, wider spacing purely for label
# legibility). y = branch offset. label_dy is hand-tuned per node so labels
# on the same horizontal line alternate above/below and never collide.
nodes <- tribble(
  ~name, ~x, ~y, ~branch, ~tier, ~color, ~label_dy,
  "Skyward Sword", 1, 0, "trunk", "main", "#2C8FCF", 0.28,
  "The Minish Cap", 2.6, 0, "trunk", "main", "#8A3AC4", -0.28,
  "Four Swords", 4.2, 0, "trunk", "spinoff", "#8A8A8A", 0.22,
  "Ocarina of Time", 5.8, 0, "trunk", "main", "#C9A227", -0.28,

  "Majora's Mask", 7.4, 1.4, "child", "main", "#FF4D8D", 0.28,
  "Twilight Princess", 9.4, 1.4, "child", "main", "#C2650F", -0.28,
  "Four Swords Adventures", 10.6, 1.85, "child", "spinoff", "#8A8A8A", 0.22,

  "The Wind Waker", 7.4, 0, "adult", "main", "#D62828", 0.28,
  "Phantom Hourglass", 9.4, 0, "adult", "main", "#0090C9", -0.28,
  "Spirit Tracks", 11.4, 0, "adult", "main", "#3E9EC7", 0.28,

  "A Link to the Past", 7.4, -1.4, "downfall", "main", "#2E86D6", -0.28,
  "Link's Awakening", 9.4, -1.4, "downfall", "main", "#E8562E", 0.28,
  "Oracle of Seasons", 11.0, -1.15, "downfall", "main", "#D9481E", 0.24,
  "Oracle of Ages", 11.0, -1.65, "downfall", "main", "#2A5FC4", -0.26,
  "A Link Between Worlds", 12.6, -1.4, "downfall", "main", "#7A45BE", -0.28,
  "Tri Force Heroes", 13.4, -0.95, "downfall", "spinoff", "#8A8A8A", 0.22,
  "The Legend of Zelda", 16.2, -1.4, "downfall", "main", "#D4A017", 0.28,
  "Zelda II", 18.2, -1.4, "downfall", "main", "#E13A1E", -0.28,

  "Breath of the Wild", 20.4, 0, "convergence", "main", "#1FC8C0", 0.28,
  "Tears of the Kingdom", 22.2, 0, "convergence", "main", "#1FA89C", -0.28
)

edges <- tribble(
  ~from, ~to,
  "Skyward Sword", "The Minish Cap",
  "The Minish Cap", "Four Swords",
  "Four Swords", "Ocarina of Time",

  "Ocarina of Time", "Majora's Mask",
  "Majora's Mask", "Twilight Princess",
  "Twilight Princess", "Four Swords Adventures",

  "Ocarina of Time", "The Wind Waker",
  "The Wind Waker", "Phantom Hourglass",
  "Phantom Hourglass", "Spirit Tracks",

  "Ocarina of Time", "A Link to the Past",
  "A Link to the Past", "Link's Awakening",
  "Link's Awakening", "Oracle of Seasons",
  "Link's Awakening", "Oracle of Ages",
  "Oracle of Seasons", "A Link Between Worlds",
  "Oracle of Ages", "A Link Between Worlds",
  "A Link Between Worlds", "Tri Force Heroes",
  "A Link Between Worlds", "The Legend of Zelda",
  "The Legend of Zelda", "Zelda II",

  "Spirit Tracks", "Breath of the Wild",
  "Twilight Princess", "Breath of the Wild",
  "Zelda II", "Breath of the Wild",
  "Breath of the Wild", "Tears of the Kingdom"
)

edge_coords <- edges %>%
  left_join(nodes %>% select(name, x, y), by = c("from" = "name")) %>%
  rename(x1 = x, y1 = y) %>%
  left_join(nodes %>% select(name, x, y), by = c("to" = "name")) %>%
  rename(x2 = x, y2 = y) %>%
  mutate(branch_color = case_when(
    to %in% c("Majora's Mask", "Twilight Princess", "Four Swords Adventures") ~ "#D81159",
    to %in% c("The Wind Waker", "Phantom Hourglass", "Spirit Tracks") ~ "#00A896",
    to %in% c("A Link to the Past", "Link's Awakening", "Oracle of Seasons", "Oracle of Ages",
              "A Link Between Worlds", "Tri Force Heroes", "The Legend of Zelda", "Zelda II") ~ "#8A6032",
    TRUE ~ "#C9A227"
  ))

nodes <- nodes %>% mutate(
  size = ifelse(tier == "main", 4.2, 2.6),
  label_y = y + label_dy
)

p <- ggplot() +
  geom_segment(data = edge_coords, aes(x = x1, y = y1, xend = x2, yend = y2, color = branch_color),
               linewidth = 1.3, lineend = "round") +
  scale_color_identity() +
  geom_point(data = nodes, aes(x, y, fill = color, size = size), shape = 21, color = "white", stroke = 1) +
  scale_fill_identity() +
  scale_size_identity() +
  geom_text(data = filter(nodes, tier == "main"), aes(x, label_y, label = name),
            size = 3.8, fontface = "bold", hjust = 0.5) +
  geom_text(data = filter(nodes, tier == "spinoff"), aes(x, label_y, label = name),
            size = 2.8, color = "grey40", fontface = "italic", hjust = 0.5) +
  annotate("text", x = 1, y = -2.3, label = "Spinoffs shown smaller/muted -- not themed individually", hjust = 0, size = 3, color = "grey50", fontface = "italic") +
  annotate("text", x = 14.8, y = -1.75, label = "(large time skip in-story)", hjust = 0.5, size = 3.4, color = "grey30", fontface = "italic") +
  labs(
    title = "The Legend of Zelda -- in-universe story chronology",
    subtitle = "Per Nintendo's official Hyrule Historia timeline (three branches diverge after Ocarina of Time; reconvergence per Nintendo's stated intent, less firmly \"canonical\" than the three-way split). Not release order -- see the release-order timeline above.",
    caption = "Child Timeline (magenta) - Adult Timeline (teal) - Downfall Timeline (bronze), converging into Breath of the Wild / Tears of the Kingdom"
  ) +
  coord_cartesian(ylim = c(-2.6, 2.2), clip = "off") +
  theme_void(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 17, margin = margin(b = 4)),
    plot.subtitle = element_text(size = 10, color = "grey30", margin = margin(b = 16)),
    plot.caption = element_text(size = 10, hjust = 0.5, margin = margin(t = 16)),
    plot.margin = margin(18, 30, 18, 30)
  )

ggsave("assets/timeline/timeline-metro.png", p, width = 20, height = 9, dpi = 150)
cat("Saved assets/timeline/timeline-metro.png\n")
