extern crate fixedbitset;
extern crate js_sys;

use fixedbitset::FixedBitSet;
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
	Dead = 0,
	Alive = 1,
}

impl From<Cell> for bool {
	fn from(cell: Cell) -> bool {
		match cell {
			Cell::Dead => false,
			Cell::Alive => true,
		}
	}
}

/*
最終的に、
[[Cell; width]; height] -> [Cell; width * height]
*/
#[wasm_bindgen]
pub struct Universe {
	width: u32,
	height: u32,
	cells: FixedBitSet,
}

impl fmt::Display for Universe {
	fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
		for line in self.cells.as_slice().chunks(self.width as usize) {
			for &cell in line {
				let symbol = if cell == 0 { '◻' } else { '◼' };
				write!(f, "{}", symbol)?;
			}
			write!(f, "\n")?;
		}
		Ok(())
	}
}

#[wasm_bindgen]
impl Universe {
	pub fn new() -> Universe {
		let width = 128;
		let height = 128;

		let size = (width * height) as usize;
		let mut cells = FixedBitSet::with_capacity(size);

		for i in 0..size {
			cells.set(
				i,
				match js_sys::Math::random() {
					x if x < 0.5 => Cell::Dead.into(),
					_ => true,
				},
			);
		}

		Universe {
			width,
			height,
			cells,
		}
	}

	pub fn render(&self) -> String {
		self.to_string()
	}

	pub fn get_index(&self, row: u32, col: u32) -> usize {
		(row * self.width + col) as usize
	}

	//あるセルの隣のセルの数を数える
	fn live_neighbor_count(&self, row: u32, col: u32) -> u8 {
		let mut count = 0;

		//-1を配列の中に入れ込むことはできないので、
		//(x + (a - 1)) % aとすることによって、
		//うまいことx-1を表現することができる
		for delta_row in [self.height - 1, 0, 1].iter().cloned() {
			for delta_col in [self.width - 1, 0, 1].iter().cloned() {
				if delta_row == 0 && delta_col == 0 {
					continue;
				}

				let neighbor_row = (row + delta_row) % self.height;
				let neighbor_col = (col + delta_col) % self.width;
				let idx = self.get_index(neighbor_row, neighbor_col);
				count += self.cells[idx] as u8;
			}
		}
		count
	}

	//時間を一つ経過させる
	pub fn tick(&mut self) {
		let mut next = self.cells.clone();

		for row in 0..self.height {
			for col in 0..self.width {
				let idx = self.get_index(row, col);
				let cell = self.cells[idx];
				let live_neighbors = self.live_neighbor_count(row, col);

				next.set(
					idx,
					match (cell, live_neighbors) {
						(true, x) if x < 2 => Cell::Dead.into(),
						(true, 2) | (true, 3) => Cell::Alive.into(),
						(true, x) if x > 3 => Cell::Dead.into(),
						(false, 3) => Cell::Alive.into(),
						(otherwise, _) => otherwise,
					},
				);
			}
		}

		self.cells = next;
	}

	pub fn width(&self) -> u32 {
		self.width
	}

	pub fn height(&self) -> u32 {
		self.height
	}

	pub fn cells(&self) -> *const usize {
		self.cells.as_slice().as_ptr()
	}
}
