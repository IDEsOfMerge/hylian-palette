# Hylian Palette -- Zelda timeline metro map (18 mainline games)
#
# Shows in-universe STORY chronology per Nintendo's official Hyrule Historia /
# Zelda Portal timeline -- including Echoes of Wisdom (2024), officially placed
# on the Downfall ("Hero is Defeated") branch between Tri Force Heroes and the
# Era of Decline (The Legend of Zelda & Zelda II). Rendered from scratch in
# this project's own visual style using each game's v1.0.0 `accentCursor` color.
#
# Run from the repo root with: Rscript --vanilla analysis/timeline_metro.R

library(ggplot2)
library(dplyr)

dir.create("assets/timeline", showWarnings = FALSE, recursive = TRUE)

nodes <- tribble(
  ~name, ~x, ~y, ~branch, ~tier, ~color, ~label_dy,
  "Skyward Sword", 1.0, 0, "trunk", "main", "#1F7AC4", 0.28,
  "The Minish Cap", 2.6, 0, "trunk", "main", "#7E34BD", -0.28,
  "Four Swords", 4.2, 0, "trunk", "spinoff", "#8A8A8A", 0.22,
  "Ocarina of Time", 5.8, 0, "trunk", "main", "#C9A227", -0.28,

  "Majora's Mask", 7.6, 1.4, "child", "main", "#BD195D", 0.28,
  "Twilight Princess", 9.8, 1.4, "child", "main", "#FF781F", -0.28,
  "Four Swords Adventures", 11.2, 1.85, "child", "spinoff", "#8A8A8A", 0.22,

  "The Wind Waker", 7.6, 0, "adult", "main", "#D62828", 0.28,
  "Phantom Hourglass", 9.8, 0, "adult", "main", "#0084BD", -0.28,
  "Spirit Tracks", 12.0, 0, "adult", "main", "#0E86B5", 0.28,

  "A Link to the Past", 7.6, -1.4, "downfall", "main", "#1E74CC", -0.28,
  "Link's Awakening", 9.6, -1.4, "downfall", "main", "#D93829", 0.28,
  "Oracle of Seasons", 11.2, -1.15, "downfall", "main", "#D63E18", 0.24,
  "Oracle of Ages", 11.2, -1.65, "downfall", "main", "#2460C9", -0.26,
  "A Link Between Worlds", 12.8, -1.4, "downfall", "main", "#7A45BE", -0.28,
  "Tri Force Heroes", 13.8, -0.95, "downfall", "spinoff", "#8A8A8A", 0.22,
  "Echoes of Wisdom", 15.2, -1.4, "downfall", "main", "#C98A08", 0.28,
  "The Legend of Zelda", 17.6, -1.4, "downfall", "main", "#C89214", -0.28,
  "Zelda II", 19.4, -1.4, "downfall", "main", "#D62828", 0.28,

  "Breath of the Wild", 21.6, 0, "convergence", "main", "#0E8A8C", 0.28,
  "Tears of the Kingdom", 23.4, 0, "convergence", "main", "#12855E", -0.28
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
  "A Link Between Worlds", "Echoes of Wisdom",
  "Echoes of Wisdom", "The Legend of Zelda",
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
    to %in% c("Majora's Mask", "Twilight Princess", "Four Swords Adventures") ~ "#BD195D",
    to %in% c("The Wind Waker", "Phantom Hourglass", "Spirit Tracks") ~ "#008B7D",
    to %in% c("A Link to the Past", "Link's Awakening", "Oracle of Seasons", "Oracle of Ages",
              "A Link Between Worlds", "Tri Force Heroes", "Echoes of Wisdom",
              "The Legend of Zelda", "Zelda II") ~ "#8A6032",
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
  annotate("text", x = 16.4, y = -1.78, label = "(Era of Decline)", hjust = 0.5, size = 3.2, color = "grey30", fontface = "italic") +
  labs(
    title = "The Legend of Zelda -- in-universe story chronology (18 mainline games)",
    subtitle = "Per Nintendo's official chronology (three branches diverge after Ocarina of Time, including Echoes of Wisdom on the Downfall branch, reconverging in the distant future).",
    caption = "Child Timeline (magenta) · Adult Timeline (teal) · Downfall Timeline (bronze), converging into Breath of the Wild & Tears of the Kingdom"
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
